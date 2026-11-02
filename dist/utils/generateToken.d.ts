export declare const accessTokenExpiresInSeconds: () => number;
/**
 * Access JWT used on API requests. It does not expire.
 * Prefer `issueAuthTokens` when logging users in so a refresh token is also created.
 */
export declare const generateAccessToken: (payload: Record<string, unknown>) => string;
/** @deprecated Use generateAccessToken — kept as alias for call-site compatibility. */
export declare const generateToken: (payload: Record<string, unknown>) => string;
//# sourceMappingURL=generateToken.d.ts.map