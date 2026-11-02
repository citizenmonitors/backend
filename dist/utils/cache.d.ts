export declare const getOrSetCache: <T>(logicalKey: string, ttlSeconds: number, producer: () => Promise<T> | T) => Promise<T>;
export declare const invalidateCacheByPrefix: (prefix: string) => Promise<void>;
export declare const invalidateCacheByPrefixes: (prefixes: string[]) => Promise<void>;
/** O(1): bump the generation instead of scanning Redis for every mobile read key. */
export declare const invalidateAllMobileReadCaches: () => Promise<void>;
//# sourceMappingURL=cache.d.ts.map