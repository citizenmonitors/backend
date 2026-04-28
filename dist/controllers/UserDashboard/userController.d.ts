import type { Request, Response } from "express";
export declare const volunteerToObserver: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare const updateUser: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare const updateUserEmailCon: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resendToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=userController.d.ts.map