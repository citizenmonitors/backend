import type { NextFunction, Request, Response } from "express";
/**
 * Populates `req.body` from multipart/form-data text fields (Postman form-data, etc.).
 * Skips when Content-Type is not multipart so `application/json` still works with `express.json()`.
 */
export declare const parseMultipartTextOnly: (req: Request, res: Response, next: NextFunction) => unknown;
//# sourceMappingURL=parseMultipartTextOnly.d.ts.map