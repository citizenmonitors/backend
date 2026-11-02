import redisClient from "./notification/redisClient.ts";

type CacheEntry = {
  expiresAt: number;
  value: string;
};

const memoryCache = new Map<string, CacheEntry>();

const now = (): number => Date.now();

const getFromMemory = <T>(key: string): T | null => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    memoryCache.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
};

const setInMemory = (key: string, ttlSeconds: number, value: unknown): void => {
  memoryCache.set(key, {
    expiresAt: now() + ttlSeconds * 1000,
    value: JSON.stringify(value),
  });
};

const getFromRedis = async <T>(key: string): Promise<T | null> => {
  if (!redisClient.isOpen) return null;
  const cached = await redisClient.get(key);
  if (!cached) return null;
  return JSON.parse(cached) as T;
};

const setInRedis = async (key: string, ttlSeconds: number, value: unknown): Promise<void> => {
  if (!redisClient.isOpen) return;
  await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
};

/*
 * Mobile read caches (per-user election and dashboard payloads) are cleared very often:
 * every result upload, incident and notification. Scanning Redis for every matching key
 * on each of those is slow on election day, so these keys carry a generation number.
 * "Invalidate all" just bumps the generation; old entries are never read again and
 * expire on their own short TTL.
 */
const GENERATION_PREFIXES = ["mobile:elections:", "mobile:dashboard:"];
const GENERATION_REDIS_KEY = "cache:generation:mobile-read";
let localGeneration = 0;

const usesGeneration = (key: string): boolean =>
  GENERATION_PREFIXES.some((prefix) => key.startsWith(prefix));

const currentGeneration = async (): Promise<string> => {
  if (redisClient.isOpen) {
    try {
      const value = await redisClient.get(GENERATION_REDIS_KEY);
      return `r${value ?? 0}`;
    } catch {
      // Fall through to the per-process generation.
    }
  }
  return `m${localGeneration}`;
};

const resolveCacheKey = async (key: string): Promise<string> =>
  usesGeneration(key) ? `${key}#${await currentGeneration()}` : key;

export const getOrSetCache = async <T>(
  logicalKey: string,
  ttlSeconds: number,
  producer: () => Promise<T> | T
): Promise<T> => {
  const key = await resolveCacheKey(logicalKey);
  try {
    const redisValue = await getFromRedis<T>(key);
    if (redisValue != null) return redisValue;
  } catch {
    // Fall back to local memory cache when Redis is unavailable.
  }

  const memoryValue = getFromMemory<T>(key);
  if (memoryValue != null) return memoryValue;

  const value = await producer();
  setInMemory(key, ttlSeconds, value);
  try {
    await setInRedis(key, ttlSeconds, value);
  } catch {
    // Best-effort Redis write; in-memory cache already set.
  }
  return value;
};

export const invalidateCacheByPrefix = async (prefix: string): Promise<void> => {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  if (!redisClient.isOpen) return;

  try {
    for await (const key of redisClient.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100,
    })) {
      await redisClient.del(String(key));
    }
  } catch {
    // Best-effort invalidation; request flow should not fail if cache cleanup fails.
  }
};

export const invalidateCacheByPrefixes = async (prefixes: string[]): Promise<void> => {
  await Promise.all(prefixes.map((prefix) => invalidateCacheByPrefix(prefix)));
};

/** O(1): bump the generation instead of scanning Redis for every mobile read key. */
export const invalidateAllMobileReadCaches = async (): Promise<void> => {
  localGeneration += 1;
  for (const key of memoryCache.keys()) {
    if (usesGeneration(key)) memoryCache.delete(key);
  }
  if (!redisClient.isOpen) return;
  try {
    await redisClient.incr(GENERATION_REDIS_KEY);
  } catch {
    // Best-effort; entries still expire on their TTL.
  }
};

