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
/*
 * Redis must never be able to stall an API request. Use it only when the connection is
 * ready (not merely "open" while reconnecting), and cap every call. On timeout or error
 * the caller falls back to the in-memory cache or the database.
 */
const REDIS_CALL_TIMEOUT_MS = 1_500;
const REDIS_SCAN_TIMEOUT_MS = 3_000;
// After a Redis failure, skip Redis for a while so every request doesn't wait for timeouts.
const REDIS_COOLDOWN_MS = 30_000;
let redisCooldownUntil = 0;
const redisReady = () => redisClient.isReady && Date.now() >= redisCooldownUntil;
const withTimeout = (promise, ms, label) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Redis ${label} timed out after ${ms}ms`)), ms);
    promise.then((value) => {
        clearTimeout(timer);
        resolve(value);
    }, (error) => {
        clearTimeout(timer);
        reject(error);
    });
});
let lastRedisWarningAt = 0;
const warnRedis = (error) => {
    redisCooldownUntil = Date.now() + REDIS_COOLDOWN_MS;
    // One line per minute is enough to spot a Redis problem in the logs.
    if (Date.now() - lastRedisWarningAt < 60_000)
        return;
    lastRedisWarningAt = Date.now();
    console.warn("Cache: Redis unavailable, using memory/database.", error instanceof Error ? error.message : error);
};
const getFromRedis = async (key) => {
    if (!redisReady())
        return null;
    const cached = await withTimeout(redisClient.get(key), REDIS_CALL_TIMEOUT_MS, "get");
    if (!cached)
        return null;
    return JSON.parse(cached);
};
const setInRedis = async (key, ttlSeconds, value) => {
    if (!redisReady())
        return;
    await withTimeout(redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds }), REDIS_CALL_TIMEOUT_MS, "set");
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
    if (redisReady()) {
        try {
            const value = await withTimeout(redisClient.get(GENERATION_REDIS_KEY), REDIS_CALL_TIMEOUT_MS, "get generation");
            return `r${value ?? 0}`;
        }
        catch (error) {
            warnRedis(error);
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
    catch (error) {
        warnRedis(error);
    }
    const memoryValue = getFromMemory(key);
    if (memoryValue != null)
        return memoryValue;
    const value = await producer();
    setInMemory(key, ttlSeconds, value);
    try {
        await setInRedis(key, ttlSeconds, value);
    }
    catch (error) {
        warnRedis(error);
    }
    return value;
};
export const invalidateCacheByPrefix = async (prefix) => {
    for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
            memoryCache.delete(key);
        }
    }
    if (!redisReady())
        return;
    const scanAndDelete = async () => {
        const batch = [];
        for await (const key of redisClient.scanIterator({ MATCH: `${prefix}*`, COUNT: 500 })) {
            batch.push(String(key));
            if (batch.length >= 500)
                await redisClient.del(batch.splice(0));
        }
        if (batch.length)
            await redisClient.del(batch);
    };
    try {
        // Best-effort and time-capped: a slow Redis must not hold up the request.
        await withTimeout(scanAndDelete(), REDIS_SCAN_TIMEOUT_MS, "scan");
    }
    catch (error) {
        warnRedis(error);
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
    if (!redisReady())
        return;
    try {
        await withTimeout(redisClient.incr(GENERATION_REDIS_KEY), REDIS_CALL_TIMEOUT_MS, "incr");
    }
    catch (error) {
        warnRedis(error);
    }
};
//# sourceMappingURL=cache.js.map