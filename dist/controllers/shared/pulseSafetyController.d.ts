/**
 * Pulse report + block handlers, shared by the web and mobile Pulse routers.
 * Routes using these must run authMiddleware first.
 */
import type { Request, Response } from "express";
/** POST /posts/:postId/report — { reason, details? } */
export declare const postPulsePostReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** POST /posts/:postId/comments/:commentId/report — { reason, details? } */
export declare const postPulseCommentReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** POST /blocks — { postId } or { commentId }: blocks that content's author. */
export declare const postPulseBlock: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** DELETE /blocks/:blockId */
export declare const deletePulseBlock: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** GET /blocks */
export declare const getPulseBlocks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=pulseSafetyController.d.ts.map