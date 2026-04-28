import type { Request, Response } from "express";
declare global {
    var baseDir: string;
}
declare const getStates: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getLGAs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getWards: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getPollingUnits: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { getStates, getLGAs, getWards, getPollingUnits };
//# sourceMappingURL=locationController.d.ts.map