import type { Request, Response } from "express";
export declare const sendPodcast: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const editPodcast: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllPodcasts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSinglePodcast: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePodcast: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserInbox: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markPodcastAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendNewsletter: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Compose page: paste draft → preview newsletter email + News & Insight HTML.
 * POST /api/admin/newsletter/preview
 */
export declare const previewNewsletterCompose: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** GET active hardcoded edition preview (fallback). */
export declare const getActiveNewsletter: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=podcastController.d.ts.map