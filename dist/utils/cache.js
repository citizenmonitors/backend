import redisClient from "./notification/redisClient.js";
const memoryCache = new Map();
const now = () => Date.now();
const getFromMemory = (key) => {
    const entry = memoryCache.get(key);
    if (!entry)
        return null;
    if (entry.expiresAt <= now()) {
        memoryCache.delete(key);
        return null;
    }
    return JSON.parse(entry.value);
};
const setInMemory = (key, ttlSeconds, value) => {
    memoryCache.set(key, {
        expiresAt: now() + ttlSeconds * 1000,
        value: JSON.stringify(value),
    });
};
const getFromRedis = async (key) => {
    if (!redisClient.isOpen)
        return null;
    const cached = await redisClient.get(key);
    if (!cached)
        return null;
    return JSON.parse(cached);
};
const setInRedis = async (key, ttlSeconds, value) => {
    if (!redisClient.isOpen)
        return;
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
const usesGeneration = (key) => GENERATION_PREFIXES.some((prefix) => key.startsWith(prefix));
const currentGeneration = async () => {
    if (redisClient.isOpen) {
        try {
            const value = await redisClient.get(GENERATION_REDIS_KEY);
            return `r${value ?? 0}`;
        }
        catch {
            // Fall through to the per-process generation.
        }
    }
    return `m${localGeneration}`;
};
const resolveCacheKey = async (key) => usesGeneration(key) ? `${key}#${await currentGeneration()}` : key;
export const getOrSetCache = async (logicalKey, ttlSeconds, producer) => {
    const key = await resolveCacheKey(logicalKey);
    try {
        const redisValue = await getFromRedis(key);
        if (redisValue != null)
            return redisValue;
    }
    catch {
        // Fall back to local memory cache when Redis is unavailable.
    }
    const memoryValue = getFromMemory(key);
    if (memoryValue != null)
        return memoryValue;
    const value = await producer();
    setInMemory(key, ttlSeconds, value);
    try {
        await setInRedis(key, ttlSeconds, value);
    }
    catch {
        // Best-effort Redis write; in-memory cache already set.
    }
    return value;
};
export const invalidateCacheByPrefix = async (prefix) => {
    for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
            memoryCache.delete(key);
        }
    }
    if (!redisClient.isOpen)
        return;
    try {
        for await (const key of redisClient.scanIterator({
            MATCH: `${prefix}*`,
            COUNT: 100,
        })) {
            await redisClient.del(String(key));
        }
    }
    catch {
        // Best-effort invalidation; request flow should not fail if cache cleanup fails.
    }
};
export const invalidateCacheByPrefixes = async (prefixes) => {
    await Promise.all(prefixes.map((prefix) => invalidateCacheByPrefix(prefix)));
};
/** O(1): bump the generation instead of scanning Redis for every mobile read key. */
export const invalidateAllMobileReadCaches = async () => {
    localGeneration += 1;
    for (const key of memoryCache.keys()) {
        if (usesGeneration(key))
            memoryCache.delete(key);
    }
    if (!redisClient.isOpen)
        return;
    try {
        await redisClient.incr(GENERATION_REDIS_KEY);
    }
    catch {
        // Best-effort; entries still expire on their TTL.
    }
};
//# sourceMappingURL=cache.js.map