import type { Request, Response } from "express";
export declare const getDashboardController: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const inviteAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAdminPermissions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const suspendAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllAdmins: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAccessControl: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAdminLogs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSingleAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserEmailsController: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=adminDashboard.d.ts.map