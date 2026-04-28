/** Normalize Express `req.params` values (string or string[] in some setups). */
export declare const asParamString: (value: string | string[] | undefined) => string;
/**
 * Validates that a value is a valid MongoDB ObjectId string.
 * Use before passing req.params.id (or similar) to findById, findByIdAndUpdate, etc.
 */
export declare const isValidObjectId: (id: unknown) => boolean;
//# sourceMappingURL=validators.d.ts.map