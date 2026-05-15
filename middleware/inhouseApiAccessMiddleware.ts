import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const HEADER_NAME = "x-inhouse-access-token";

const parseAllowedTokens = (): string[] => {
  const raw = process.env.INHOUSE_API_ACCESS_TOKEN?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const timingSafeMatch = (provided: string, expected: string): boolean => {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const inhouseApiAccessMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowed = parseAllowedTokens();
  if (allowed.length === 0) {
    next();
    return;
  }

  const provided = String(req.get(HEADER_NAME) ?? "").trim();
  if (!provided) {
    res.status(401).json({
      message: "API access token is required",
      hint: `Send header with the value configured as API_ACCESS_TOKEN`,
    });
    return;
  }

  const ok = allowed.some((token) => timingSafeMatch(provided, token));
  if (!ok) {
    res.status(403).json({ message: "Invalid API access token" });
    return;
  }

  next();
};
