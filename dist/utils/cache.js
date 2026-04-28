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
//# sourceMappingURL=cache.js.map