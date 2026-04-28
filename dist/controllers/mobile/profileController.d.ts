import type { Request, Response } from "express";
export declare const getMyProfileMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateMyProfileMobile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare const updateMyPasswordMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const volunteerToObserverMobile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare const upsertObserverDataMobile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare const publicViewerToVolunteerMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getElectionVaultMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const locatePollingUnitMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNotificationSettingsMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateNotificationSettingsMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const submitFeedbackMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const generateAnonymousUsernameMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const setAnonymousIdentityToggleMobile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=profileController.d.ts.map