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
export const getOrSetCache = async (key, ttlSeconds, producer) => {
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
export const invalidateAllMobileReadCaches = async () => {
    await invalidateCacheByPrefixes(["mobile:elections:", "mobile:dashboard:"]);
};
//# sourceMappingURL=cache.js.map