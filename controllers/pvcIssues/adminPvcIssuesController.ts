import type { Request, Response } from "express";
import {
  getPvcIssueReportById,
  listPvcIssueReports,
} from "../../services/pvcIssues/pvcIssuesService.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const listReports = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const data = await listPvcIssueReports();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getReportById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = asParamString(req.params.id);
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }
    const report = await getPvcIssueReportById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    return res.json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};
