import type { Request, Response } from "express";
import { submitPvcIssueReport } from "../../services/pvcIssues/pvcIssuesService.ts";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

type UploadedFilesMap = Record<
  string,
  | { originalname: string; mimetype: string; size: number; buffer: Buffer }
  | Array<{ originalname: string; mimetype: string; size: number; buffer: Buffer }>
>;

export const submitReport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const files = (req as Request & { files?: UploadedFilesMap }).files;
    const result = await submitPvcIssueReport(req.body, files);
    return res.status(201).json(result);
  } catch (error) {
    console.error("PVC issue submission failed:", error);
    const message = getErrorMessage(error);
    const status = message.includes("Invalid file") || message.includes("5MB") ? 400 : 500;
    return res.status(status).json({ message });
  }
};
