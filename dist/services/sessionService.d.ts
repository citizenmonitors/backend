type SessionUser = {
    email?: string;
    role?: string;
};
export declare const validateSession: (token: string) => Promise<SessionUser>;
export {};
//# sourceMappingURL=sessionService.d.ts.map