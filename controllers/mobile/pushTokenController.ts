import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import {
  registerPushToken,
  unregisterPushToken,
} from "../../services/mobile/pushNotificationService.ts";

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/** POST /profile/push-token — { token, platform } */
export const postPushToken = async (req: Request, res: Response) => {
  try {
    const userId = String((req as AuthenticatedRequest).user!._id);
    const data = await registerPushToken(userId, req.body ?? {});
    return res.status(200).json(data);
  } catch (error) {
    const message = errMsg(error);
    if (message.includes("required") || message.includes("Invalid")) {
      return res.status(400).json({ message });
    }
    if (message.includes("not found")) return res.status(404).json({ message });
    return res.status(500).json({ message });
  }
};

/** DELETE /profile/push-token — { token } (body optional) */
export const deletePushToken = async (req: Request, res: Response) => {
  try {
    const userId = String((req as AuthenticatedRequest).user!._id);
    const data = await unregisterPushToken(userId, req.body ?? {});
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: errMsg(error) });
  }
};
