import type { Request, Response } from "express";
/** POST /profile/push-token — { token, platform } */
export declare const postPushToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/** DELETE /profile/push-token — { token } (body optional) */
export declare const deletePushToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=pushTokenController.d.ts.map