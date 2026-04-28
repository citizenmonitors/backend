import type { Request, Response } from "express";
import getBanks from "../services/bankService.ts";
import { getOrSetCache } from "../utils/cache.ts";

export const getAllBanks = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const banks = await getOrSetCache("banks:all", 3600, getBanks);
    return res.status(200).json({ banks });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message: "Failed to fetch banks", error: message });
  }
};
