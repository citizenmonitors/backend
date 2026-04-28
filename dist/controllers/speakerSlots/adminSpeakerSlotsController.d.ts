import type { Request, Response } from "express";
export declare function getEvents(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getDays(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createDay(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function patchDay(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getConfirmedBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function exportCsv(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function patchBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteSlot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createSlots(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getSlots(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createInvites(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function sendReminders(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/** Re-run speaker-slots seed: creates event, 3 days, slots, and one invite (from seed JSON). */
export declare function runSeed(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=adminSpeakerSlotsController.d.ts.map