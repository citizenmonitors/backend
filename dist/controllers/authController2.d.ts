import type { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const verifyEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const submitRoleForm: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare const signIn: (req: Request, res: Response) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController2.d.ts.map