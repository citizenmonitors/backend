export declare const getOrSetCache: <T>(key: string, ttlSeconds: number, producer: () => Promise<T> | T) => Promise<T>;
export declare const invalidateCacheByPrefix: (prefix: string) => Promise<void>;
export declare const invalidateCacheByPrefixes: (prefixes: string[]) => Promise<void>;
export declare const invalidateAllMobileReadCaches: () => Promise<void>;
//# sourceMappingURL=cache.d.ts.map