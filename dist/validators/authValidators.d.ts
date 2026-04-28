import type { NextFunction, Request, Response } from "express";
/**
 * Middleware: send 400 with validation errors if any
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void | Response;
export declare const registerValidation: import("express-validator").ValidationChain[];
export declare const verifyEmailValidation: import("express-validator").ValidationChain[];
export declare const resendTokenValidation: import("express-validator").ValidationChain[];
export declare const pickRoleValidation: import("express-validator").ValidationChain[];
export declare const signInValidation: import("express-validator").ValidationChain[];
export declare const forgotPasswordValidation: import("express-validator").ValidationChain[];
export declare const resetPasswordValidation: import("express-validator").ValidationChain[];
export declare const submitDetailsValidation: import("express-validator").ValidationChain[];
export declare const submitObserverDetailsValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=authValidators.d.ts.map