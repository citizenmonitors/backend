import type { Request, Response } from "express";
export declare const registerMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyEmailMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resendTokenMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const signInMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const continueWithGoogleMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const setPasswordMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const validateSessionMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const forgotPasswordMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resendForgotPasswordOtpMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resetPasswordMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const selectRoleMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const submitDetailsMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const submitObserverDetailsMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map