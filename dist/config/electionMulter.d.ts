import type { NextFunction, Request, Response } from "express";
/** Admin create News / Press — file fields: `thumbnail` (+ optional hero under any accepted alias). */
export declare const uploadNewsPressAdminImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const runNewsPressAdminUpload: (req: Request, res: Response, next: NextFunction) => void;
/** Parses multipart form-data (text fields + image files). Skips for JSON bodies. */
export declare const parseNewsPressAdminMultipart: (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadResultDataFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadReportDataFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadCollationDiscussionFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadPulsePostFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** Optional evidence when flagging another user's result or incident (polling-unit verification). */
export declare const uploadFlagEvidenceFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=electionMulter.d.ts.map