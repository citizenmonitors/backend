import type { NextFunction, Request, Response } from "express";
/**
 * When `INHOUSE_API_ACCESS_TOKEN` is set (single value or comma-separated),
 * every request under `/api` must send header `X-Inhouse-Access-Token` matching one of them.
 * This is separate from the user JWT (`Authorization: Bearer ...`).
 *
 * If the env var is unset, this middleware is a no-op (backward compatible for local dev).
 */
export declare const inhouseApiAccessMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=inhouseApiAccessMiddleware.d.ts.map