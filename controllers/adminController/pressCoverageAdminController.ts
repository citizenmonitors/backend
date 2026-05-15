import type { Request, Response } from "express";
import { buildPressCoverageCreatePayload } from "./articleAdminCreateBody.ts";
import {
  createPressCoverageArticle,
  getPressCoverageByIdForAdmin,
  listPressCoverageForAdmin,
} from "../../services/adminService/pressCoverageAdminService.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const parsePageLimit = (req: Request) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? "30"), 10) || 30));
  return { page, limit };
};

export const createPressCoverageAdmin = async (req: Request, res: Response) => {
  try {
    const payload = await buildPressCoverageCreatePayload(req);
    const created = await createPressCoverageArticle(payload);
    return res.status(201).json(created);
  } catch (error) {
    const msg = getErrorMessage(error);
    if (
      msg.includes("required") ||
      msg.includes("Invalid") ||
      msg.includes("thumbnail") ||
      msg.includes("upload")
    ) {
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: msg });
  }
};

export const listPressCoverageAdmin = async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePageLimit(req);
    const data = await listPressCoverageForAdmin({ page, limit });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getPressCoverageByIdAdmin = async (req: Request, res: Response) => {
  try {
    const id = asParamString(req.params.id);
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    const row = await getPressCoverageByIdForAdmin(id);
    return res.status(200).json(row);
  } catch (error) {
    const msg = getErrorMessage(error);
    if (msg === "Article not found") return res.status(404).json({ message: msg });
    if (msg.includes("Invalid")) return res.status(400).json({ message: msg });
    return res.status(500).json({ message: msg });
  }
};
