import * as AdminService from "../../services/adminService/adminDashboard.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
export const getDashboardController = async (_req, res) => {
    try {
        const data = await AdminService.getDashboardData();
        return res.status(200).json(data);
    }
    catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
};
export const inviteAdmin = async (req, res) => {
    try {
        const adminId = req.user?._id;
        const data = await AdminService.createAdminService(adminId, req.body);
        return res.json({ message: "Invitation sent", data });
    }
    catch (error) {
        const message = getErrorMessage(error);
        res
            .status(500)
            .json({ message: "Error inviting admin", error: message });
    }
};
export const updateAdminPermissions = async (req, res) => {
    try {
        const adminId = asParamString(req.params.adminId);
        if (!isValidObjectId(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID" });
        }
        const updatedBy = req.user._id;
        const { role, permissions } = req.body;
        const updatedPermissions = await AdminService.updateAdminPermissionsService(adminId, updatedBy, { role, permissions });
        return res.json(updatedPermissions);
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(500).json({
            message: "Error updating admin permissions",
            error: message,
        });
    }
};
export const suspendAdmin = async (req, res) => {
    try {
        const adminId = asParamString(req.params.adminId);
        if (!isValidObjectId(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID" });
        }
        const suspendedBy = req.user._id;
        const updatedAdmin = await AdminService.suspendAdminService(adminId, suspendedBy);
        return res.json(updatedAdmin);
    }
    catch (error) {
        const message = getErrorMessage(error);
        res
            .status(500)
            .json({ message: "Error suspending admin", error: message });
    }
};
export const getAllAdmins = async (_req, res) => {
    try {
        const data = await AdminService.getAllAdminsService();
        return res.json(data);
    }
    catch (error) {
        const message = getErrorMessage(error);
        res
            .status(500)
            .json({ message: "Error fetching admins", error: message });
    }
};
export const getAccessControl = async (_req, res) => {
    try {
        const data = await AdminService.getAccessControlService();
        return res.json(data);
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(500).json({
            message: "Error fetching access control logs",
            error: message,
        });
    }
};
export const getAdminLogs = async (req, res) => {
    try {
        const adminId = asParamString(req.params.adminId);
        if (!isValidObjectId(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID" });
        }
        const data = await AdminService.getAdminLogsService(adminId);
        return res.json(data);
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(500).json({
            message: "Error fetching logs",
            error: message,
        });
    }
};
export const getSingleAdmin = async (req, res) => {
    try {
        const adminId = asParamString(req.params.adminId);
        if (!isValidObjectId(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID" });
        }
        const { role, permissions } = req.body;
        const admin = await AdminService.getSingleAdminService(adminId, { role, permissions });
        return res.json(admin);
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(500).json({
            message: "Error fetching admin details",
            error: message,
        });
    }
};
export const getUserEmailsController = async (_req, res) => {
    try {
        const emails = await AdminService.getUserEmailsService();
        const emailList = emails.join("\n");
        res.setHeader("Content-Type", "text/plain");
        return res.status(200).send(emailList);
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(500).json({
            success: false,
            message: message || "Server Error",
        });
    }
};
//# sourceMappingURL=adminDashboard.js.map