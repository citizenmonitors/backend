import type { Request, Response } from "express";
export declare const getNewsInsightsListMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNewsInsightBySlugMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const postNewsInsightArticleLikeMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNewsInsightArticleCommentsMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const postNewsInsightArticleCommentMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const postNewsInsightCommentLikeMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** PATCH /articles/:articleId/comments/:commentId — { body?, useAnonymousDisplay? } */
export declare const patchNewsInsightCommentMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** DELETE /articles/:articleId/comments/:commentId — comment author or admin. */
export declare const deleteNewsInsightCommentMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=newsInsightController.d.ts.map