import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";
import {
  listPulseReportsAdmin,
  resolvePulseReportAdmin,
} from "../../services/mobile/pulseModerationService.ts";

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/** GET /admin/pulse/reports?status=open|dismissed|removed|all&page=1&limit=20 */
export const listPulseReports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page ?? "1"), 10) || 1;
    const limit = parseInt(String(req.query.limit ?? "20"), 10) || 20;
    const data = await listPulseReportsAdmin({ status: req.query.status, page, limit });
    return res.status(200).json(data);
  } catch (error) {
    const message = errMsg(error);
    return res.status(message.includes("Invalid status") ? 400 : 500).json({ message });
  }
};

/** PATCH /admin/pulse/reports/:reportId — { action: "dismiss" | "remove", note? } */
export const resolvePulseReport = async (req: Request, res: Response) => {
  try {
    const reportId = asParamString(req.params.reportId);
    if (!isValidObjectId(reportId)) return res.status(400).json({ message: "Invalid report id" });
    const adminId = String((req as AuthenticatedRequest).user!._id);
    const b = (req.body ?? {}) as Record<string, unknown>;
    const data = await resolvePulseReportAdmin(adminId, reportId, {
      action: b.action,
      note: b.note,
    });
    return res.status(200).json(data);
  } catch (error) {
    const message = errMsg(error);
    if (message.includes("not found")) return res.status(404).json({ message });
    if (message.includes("Invalid action") || message.includes("note must")) {
      return res.status(400).json({ message });
    }
    return res.status(500).json({ message });
  }
};
