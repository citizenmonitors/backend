/**
 * Pulse edit / delete / unlike / undo-repost handlers.
 * Shared by the web (/api/pulse, /api/v1/pulse) and mobile (/api/v1/mobile/pulse) routers.
 * All routes using these must run authMiddleware first.
 */
import type { Request, Response } from "express";
/** GET /posts/:postId — one post (auth optional on web, required on mobile). */
export declare const getPulsePostById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** PATCH /posts/:postId — multipart or JSON: body, visibilityScope, useAnonymousDisplay, removeImage, image file. */
export declare const patchPulsePost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** DELETE /posts/:postId */
export declare const removePulsePost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** DELETE /posts/:postId/repost — postId may be the original or your repost of it. */
export declare const removePulseRepost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** DELETE /posts/:postId/like */
export declare const removePulsePostLike: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** PATCH /posts/:postId/comments/:commentId — body, useAnonymousDisplay */
export declare const patchPulseComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** DELETE /posts/:postId/comments/:commentId — comment author or post author. */
export declare const removePulseComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** DELETE /posts/:postId/comments/:commentId/like */
export declare const removePulseCommentLike: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=pulseManageController.d.ts.map