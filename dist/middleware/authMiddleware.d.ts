import type { NextFunction, Request, Response } from "express";
export type { AuthenticatedRequest, AuthenticatedUser } from "../types/authenticatedRequest.ts";
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const isSuperAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const isAuthorized: (action: string) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=authMiddleware.d.ts.map