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

export const getOrSetCache = async <T>(
  key: string,
  ttlSeconds: number,
  producer: () => Promise<T> | T
): Promise<T> => {
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

