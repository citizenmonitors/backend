import type { Request, Response } from "express";
/** Public GET. scope=all needs no auth; state/lga/ward/polling-unit uses the signed-in user's location. */
export declare const getPulsePostsPublic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** Public web pulse comments — no auth, no location filter. */
export declare const getPulsePostCommentsPublic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** Auth required — create a pulse post (uses author profile location for audience). */
export declare const postPulsePostWeb: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const postPulseRepostWeb: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const postPulsePostLikeWeb: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const postPulsePostCommentWeb: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const postPulseCommentLikeWeb: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=pulseController.d.ts.map