import type { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resendToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const pickRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const submitRoleForm: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const submitObserverDetailsController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const signIn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resetPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateUserSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authController.d.ts.map