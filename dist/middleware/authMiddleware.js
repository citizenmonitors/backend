import mongoose from "mongoose";
import CompletedUser from "../models/CompletedUser.js";
import { extractBearerToken, verifyJwtEmail } from "../utils/authToken.js";
// Authentication Middleware
export const authMiddleware = async (req, res, next) => {
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
        const permissions = rawPerms &&
            typeof rawPerms === "object" &&
            !(rawPerms instanceof mongoose.Types.ObjectId)
            ? rawPerms
            : {};
        const r = req;
        r.user = { ...user, permissions };
        next();
    }
    catch (err) {
        if (err &&
            typeof err === "object" &&
            "name" in err &&
            err.name === "TokenExpiredError") {
            return res
                .status(401)
                .json({ message: "Session expired. Please log in again." });
        }
        res.status(401).json({ message: "Authentication failed" });
    }
};
//  Check if User is Admin
export const isAdmin = (req, res, next) => {
    const r = req;
    if (r.user?.role === "admin" || r.user?.role === "super-admin") {
        return next();
    }
    res.status(403).json({ message: "Access denied: Admins only." });
};
// Check if User is Super Admin
export const isSuperAdmin = (req, res, next) => {
    const r = req;
    if (r.user?.role === "super-admin") {
        return next();
    }
    res.status(403).json({ message: "Access denied: Super Admins only." });
};
//  Dynamic Permission Middleware
export const isAuthorized = (action) => (req, res, next) => {
    const r = req;
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
//# sourceMappingURL=authMiddleware.js.map