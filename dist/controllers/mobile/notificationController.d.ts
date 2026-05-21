import type { Request, Response } from "express";
export declare const listMobileNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMobileNotificationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const readMobileNotification: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const readAllMobileNotifications: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** Dev/staging only — sends a test notification to the logged-in user (inbox + socket + push). */
export declare const sendTestMobileNotification: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const dismissMobileNotificationController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=notificationController.d.ts.map