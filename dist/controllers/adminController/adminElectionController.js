import * as AdminDashServices from "../../services/adminService/adminDashboard.js";
import * as AdminService from "../../services/adminService/adminElectionService.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
export const getDashboardDataController = async (_req, res) => {
    try {
        const dashboardData = await AdminService.getDashboardDataService();
        res.status(200).json(dashboardData);
    }
    catch (error) {
        res.status(500).json({ error: getErrorMessage(error) });
    }
};
export const getAllAdminController = async (_req, res) => {
    try {
        const admins = await AdminService.getAllAdminService();
        res.status(200).json(admins);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching admins",
            error: getErrorMessage(error),
        });
    }
};
export const getAllElections = async (_req, res) => {
    try {
        const elections = await AdminDashServices.getAllActiveElectionsService();
        res.status(200).json({ elections });
    }
    catch (error) {
        console.error("Error fetching elections:", error);
        res.status(500).json({
            message: "Error fetching elections",
            error: getErrorMessage(error),
        });
    }
};
export const getAllElectionTypes = async (_req, res) => {
    try {
        const elections = await AdminDashServices.getAllElectionTypesService();
        res.status(200).json({ elections });
    }
    catch (error) {
        console.error("Error fetching elections:", error);
        res.status(500).json({
            message: "Error fetching elections",
            error: getErrorMessage(error),
        });
    }
};
export const getAdminLiveElectionController = async (req, res) => {
    try {
        const electionId = asParamString(req.params.electionId);
        if (!electionId || !isValidObjectId(electionId)) {
            return res.status(400).json({ message: "Valid election ID is required." });
        }
        const result = await AdminDashServices.getAdminLiveElectionService(electionId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching admin live election data:", error);
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
// Fetch all results and incidents
export const getAllElectionAndIncidentController = async (_req, res) => {
    try {
        const results = await AdminService.getAllResultService();
        res.status(200).json({ results });
    }
    catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getResultOrIncidentByController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const resultOrIncident = await AdminService.getResultOrIncidentByIdService(id);
        res.status(200).json({ result: resultOrIncident });
    }
    catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
// Delete result or incident
export const deletedResultOrIncidentController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const adminId = req.user._id;
        const result = await AdminService.deleteResultOrIncidentService(id, adminId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting result or incident",
            error: getErrorMessage(error),
        });
    }
};
export const getAllUsersController = async (_req, res) => {
    try {
        const results = await AdminDashServices.getAllUsersService();
        res.status(200).json({ results });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching users and stats",
            error: getErrorMessage(error),
        });
    }
};
export const getUserByIdController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const user = await AdminDashServices.getUserByIdService(id);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching user",
            error: getErrorMessage(error),
        });
    }
};
export const deleteUserByIdController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const adminId = req.user._id;
        const result = await AdminDashServices.deleteUserService(id, adminId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting user",
            error: getErrorMessage(error),
        });
    }
};
export const approveObserverController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const adminId = req.user._id;
        const response = await AdminDashServices.approveObserverService(id, adminId);
        res.status(200).json(response);
    }
    catch (error) {
        console.error(`Error in approveObserverController: ${getErrorMessage(error)}`);
        res.status(500).json({ error: getErrorMessage(error) });
    }
};
export const getAllObserver = async (_req, res) => {
    try {
        const data = await AdminDashServices.getAllObsersverService();
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const unapproveObserverController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const adminId = req.user._id;
        const result = await AdminDashServices.unapproveObserverService(id, adminId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(`Error in unapproveObserverController: ${getErrorMessage(error)}`);
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const downgradeObserverController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const { adminReason } = req.body;
        const adminId = req.user._id;
        // Validate admin reason
        if (!adminReason) {
            return res.status(400).json({ message: "Admin reason is required" });
        }
        const result = await AdminDashServices.downgradeObserverService(id, adminReason, adminId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(`Error in downgradeObserverController: ${getErrorMessage(error)}`);
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getFlaggedResultsCon = async (_req, res) => {
    try {
        const results = await AdminService.getFlaggedResultsService();
        res.status(200).json({ results });
    }
    catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const deleteFlaggedResultController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const adminId = req.user._id;
        const result = await AdminService.deleteFlaggedResults(id, adminId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting flagged result",
            error: getErrorMessage(error),
        });
    }
};
export const restoreFlaggedResultController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const adminId = req.user._id;
        const result = await AdminService.restoreFlaggedResult(id, adminId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error restoring flagged result",
            error: getErrorMessage(error),
        });
    }
};
export const getSingleFlaggedElectionController = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const resultOrIncident = await AdminService.getSingleFlaggedElectionService(id);
        res.status(200).json({ result: resultOrIncident });
    }
    catch (error) {
        console.error(`Error fetching flagged election: ${getErrorMessage(error)}`);
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const adminNotificationController = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await AdminService.adminNotificationService(userId);
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = asParamString(req.params.notificationId);
        if (!isValidObjectId(notificationId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }
        const userId = req.user._id;
        const result = await AdminService.markNotificationAsReadService(notificationId, userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error marking notification as read",
            error: getErrorMessage(error),
        });
    }
};
export const deleteNotificationForUser = async (req, res) => {
    try {
        const notificationId = asParamString(req.params.notificationId);
        if (!isValidObjectId(notificationId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }
        const userId = req.user._id;
        const result = await AdminService.deleteNotificationForUserService(notificationId, userId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting notification",
            error: getErrorMessage(error),
        });
    }
};
//# sourceMappingURL=adminElectionController.js.map