import type { Request } from "express";
import type { Types } from "mongoose";

/**
 * User attached by `authMiddleware`: lean CompletedUser with `permissions`
 * normalized from populated `adminPermissions`.
 */
export type AuthenticatedUser = {
  _id?: Types.ObjectId | string;
  email?: string;
  role?: string;
  adminPermissions?: unknown;
  permissions?: Record<string, boolean>;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
  /** Present when route uses multer */
  files?: unknown;
};
