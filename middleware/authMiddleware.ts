import mongoose from "mongoose";
import CompletedUser from "../models/CompletedUser.ts";
import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest, AuthenticatedUser } from "../types/authenticatedRequest.ts";
import { extractBearerToken, verifyJwtEmail } from "../utils/authToken.ts";

export type { AuthenticatedRequest, AuthenticatedUser } from "../types/authenticatedRequest.ts";







// Authentication Middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractBearerToken(req.header("Authorization"));

  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing" });
  }

  try {
    const email = verifyJwtEmail(token);

    const user = await CompletedUser.findOne({ email })
      .populate("adminPermissions")
      .lean();
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const rawPerms = user.adminPermissions;
    const permissions: Record<string, boolean> =
      rawPerms &&
      typeof rawPerms === "object" &&
      !(rawPerms instanceof mongoose.Types.ObjectId)
        ? (rawPerms as Record<string, boolean>)
        : {};

    const r = req as AuthenticatedRequest;
    r.user = { ...user, permissions } as AuthenticatedUser;
    next();
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      err.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }
    res.status(401).json({ message: "Authentication failed" });
  }
};

/** If a valid Bearer token is present, attaches `user` (same shape as authMiddleware). Invalid or missing token continues without user. */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = extractBearerToken(req.header("Authorization"));
  if (!token) return next();

  try {
    const email = verifyJwtEmail(token);
    const user = await CompletedUser.findOne({ email })
      .populate("adminPermissions")
      .lean();
    if (!user) return next();

    const rawPerms = user.adminPermissions;
    const permissions: Record<string, boolean> =
      rawPerms &&
      typeof rawPerms === "object" &&
      !(rawPerms instanceof mongoose.Types.ObjectId)
        ? (rawPerms as Record<string, boolean>)
        : {};

    const r = req as AuthenticatedRequest;
    r.user = { ...user, permissions } as AuthenticatedUser;
  } catch {
    // ignore invalid/expired token for optional-auth routes
  }
  next();
};

//  Check if User is Admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const r = req as AuthenticatedRequest;
  if (r.user?.role === "admin" || r.user?.role === "super-admin") {
    return next();
  }
  res.status(403).json({ message: "Access denied: Admins only." });
};

// Check if User is Super Admin
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const r = req as AuthenticatedRequest;
  if (r.user?.role === "super-admin") {
    return next();
  }
  res.status(403).json({ message: "Access denied: Super Admins only." });
};

//  Dynamic Permission Middleware
export const isAuthorized = (action: string) => (req: Request, res: Response, next: NextFunction) => {
  const r = req as AuthenticatedRequest;
  if (!r.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (r.user.role === "super-admin") {
    return next(); 
  }

  if (r.user.permissions && r.user.permissions[action]) {
    return next();
  }

  res
    .status(403)
    .json({
      message: `Access denied: You do not have permission to ${action}`,
    });
};
