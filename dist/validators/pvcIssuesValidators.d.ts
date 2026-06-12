import type { NextFunction, Request, Response } from "express";
import { PVC_ISSUE_TYPES } from "../models/PvcIssues/pvcIssuesReport.js";
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void | Response;
export declare const isValidNigerianPhone: (value: string) => boolean;
export declare const normalizeNigerianPhone: (value: string) => string;
export declare const submitPvcIssueValidation: import("express-validator").ValidationChain[];
export { PVC_ISSUE_TYPES };
//# sourceMappingURL=pvcIssuesValidators.d.ts.map