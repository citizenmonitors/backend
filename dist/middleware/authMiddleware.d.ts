import type { NextFunction, Request, Response } from "express";
export type { AuthenticatedRequest, AuthenticatedUser } from "../types/authenticatedRequest.ts";
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/** If a valid Bearer token is present, attaches `user` (same shape as authMiddleware). Invalid or missing token continues without user. */
export declare const optionalAuthMiddleware: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const isSuperAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const isAuthorized: (action: string) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=authMiddleware.d.ts.map