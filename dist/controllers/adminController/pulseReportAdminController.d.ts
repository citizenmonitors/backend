import type { Request, Response } from "express";
/** GET /admin/pulse/reports?status=open|dismissed|removed|all&page=1&limit=20 */
export declare const listPulseReports: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** PATCH /admin/pulse/reports/:reportId — { action: "dismiss" | "remove", note? } */
export declare const resolvePulseReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=pulseReportAdminController.d.ts.map