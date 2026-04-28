import type { Request, Response } from "express";
type ControllerRequest = Request;
export declare function getSeedData(req: ControllerRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getInvite(req: ControllerRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function bookSlot(req: ControllerRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingConfirm(req: ControllerRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingIcs(req: ControllerRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=speakerSlotsController.d.ts.map