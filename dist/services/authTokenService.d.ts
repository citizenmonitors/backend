export type IssuedAuthTokens = {
    token: string;
    refreshToken: string;
    expiresIn: number;
};
export type IssueAuthTokensMeta = {
    userAgent?: string | null;
    deviceId?: string | null;
};
export declare const issueAuthTokens: (email: string, meta?: IssueAuthTokensMeta) => Promise<IssuedAuthTokens>;
export declare const refreshAuthTokens: (rawRefreshToken: string, meta?: IssueAuthTokensMeta) => Promise<IssuedAuthTokens>;
export declare const revokeRefreshToken: (rawRefreshToken: string) => Promise<void>;
export declare const revokeAllRefreshTokensForEmail: (email: string) => Promise<void>;
//# sourceMappingURL=authTokenService.d.ts.map