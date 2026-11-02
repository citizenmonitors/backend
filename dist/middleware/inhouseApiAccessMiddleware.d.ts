import type { NextFunction, Request, Response } from "express";
/** Call at process startup. Production must have at least one token configured. */
export declare const assertInhouseApiAccessConfigured: () => void;
export declare const inhouseApiAccessMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=inhouseApiAccessMiddleware.d.ts.map