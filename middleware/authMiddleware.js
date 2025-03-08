import jwt from "jsonwebtoken";
import CompletedUser from "../models/CompletedUser.js";







// Authentication Middleware
export const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await CompletedUser.findOne({ email: decoded.email }).lean(); 
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }
    res.status(401).json({ message: "Authentication failed" });
  }
};

//  Check if User is Admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.role === "super-admin") {
    return next();
  }
  res.status(403).json({ message: "Access denied: Admins only." });
};

// Check if User is Super Admin
export const isSuperAdmin = (req, res, next) => {
  if (req.user?.role === "super-admin") {
    return next();
  }
  res.status(403).json({ message: "Access denied: Super Admins only." });
};

//  Dynamic Permission Middleware
export const isAuthorized = (action) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role === "super-admin") {
    return next(); 
  }

  if (req.user.permissions && req.user.permissions[action]) {
    return next();
  }

  res
    .status(403)
    .json({
      message: `Access denied: You do not have permission to ${action}`,
    });
};
