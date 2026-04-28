/**
 * Normalize location path segments and folder names for resilient matching
 * against `data/states/...` directory names (hyphens, numeric prefixes,
 * extra spaces, punctuation, etc.).
 */
export declare function slugifyForLocationMatch(raw: string): string;
/** Strip leading `NN-` segment used on many state/LGA/ward folders. */
export declare function stripLeadingNumericSlugSegment(slug: string): string;
//# sourceMappingURL=locationNormalize.d.ts.map