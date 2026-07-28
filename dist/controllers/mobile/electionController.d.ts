import type { Request, Response } from "express";
export declare const getActiveElectionsMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLiveElectionsCarouselMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyElectionSubmissionMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const submitElectionResultMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateElectionResultMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteElectionResultMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const submitIncidentReportMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateIncidentReportMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteIncidentReportMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Mobile: PU-scoped agree/flag for one ActiveElection.
 * Same rules as web POST /api/elections/user-action; path includes activeElectionId
 * because the mobile UI opens an election first.
 */
export declare const postMobileElectionUserAction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=electionController.d.ts.map