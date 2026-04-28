import type { Request, Response } from "express";
import { validateSession } from "../services/sessionService.ts";
import { extractBearerToken } from "../utils/authToken.ts";

export const validateUserSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) return res.status(401).json({ message: "Invalid token" });

    const user = await validateSession(token);
    return res.status(200).json(user);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
