import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import { getMobileDashboard } from "../../services/mobile/dashboardService.ts";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const getDashboardMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    if (!r.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const data = await getMobileDashboard(r.user);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};
