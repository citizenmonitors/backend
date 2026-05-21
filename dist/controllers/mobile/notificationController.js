import { isValidObjectId } from "../../utils/validators.js";
import { dismissMobileNotification, getMobileNotificationDetail, getMobileNotifications, markAllMobileNotificationsRead, markMobileNotificationRead, } from "../../services/mobile/notificationService.js";
import { dispatchNotificationToUsers } from "../../services/mobile/notificationDispatchService.js";
const messageOf = (error) => error instanceof Error ? error.message : String(error);
const requireUser = (req) => {
    if (!req.user?._id)
        throw new Error("Authentication required");
    return req.user;
};
export const listMobileNotifications = async (req, res) => {
    try {
        const r = req;
        const user = requireUser(r);
        const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
        const data = await getMobileNotifications({ user, page, limit });
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: messageOf(error) });
    }
};
export const getMobileNotificationById = async (req, res) => {
    try {
        const r = req;
        const user = requireUser(r);
        const notificationId = String(req.params.notificationId ?? "");
        if (!isValidObjectId(notificationId)) {
            return res.status(400).json({ message: "Invalid notification id" });
        }
        const notification = await getMobileNotificationDetail({ user, notificationId });
        return res.status(200).json({ notification });
    }
    catch (error) {
        const message = messageOf(error);
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const readMobileNotification = async (req, res) => {
    try {
        const r = req;
        const user = requireUser(r);
        const notificationId = String(req.params.notificationId ?? "");
        if (!isValidObjectId(notificationId)) {
            return res.status(400).json({ message: "Invalid notification id" });
        }
        const result = await markMobileNotificationRead({ user, notificationId });
        return res.status(200).json(result);
    }
    catch (error) {
        const message = messageOf(error);
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const readAllMobileNotifications = async (_req, res) => {
    try {
        const r = _req;
        const user = requireUser(r);
        const result = await markAllMobileNotificationsRead({ user });
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: messageOf(error) });
    }
};
/** Dev/staging only — sends a test notification to the logged-in user (inbox + socket + push). */
export const sendTestMobileNotification = async (req, res) => {
    const allowTest = process.env.NODE_ENV !== "production" ||
        process.env.ALLOW_NOTIFICATION_TEST === "true" ||
        process.env.ALLOW_NOTIFICATION_TEST === "1";
    if (!allowTest) {
        return res.status(404).json({ message: "Not found" });
    }
    try {
        const r = req;
        const user = requireUser(r);
        const userId = String(user._id);
        const body = typeof req.body?.body === "string" && req.body.body.trim()
            ? req.body.body.trim()
            : "Test notification from Citizen Monitors";
        const info = typeof req.body?.info === "string" ? req.body.info.trim() : "Use this to verify inbox, socket, and push.";
        const notification = await dispatchNotificationToUsers({
            type: "newsletter",
            preferenceKey: "newsletter",
            body,
            info,
            userIds: [userId],
            respectPreferences: false,
        });
        if (!notification) {
            return res.status(200).json({
                message: "No notification created (user not found or dispatch skipped)",
                delivered: false,
            });
        }
        return res.status(201).json({
            message: "Test notification sent",
            delivered: true,
            notification: {
                id: String(notification._id),
                type: notification.type,
                body: notification.body,
                info: notification.info,
                createdAt: notification.createdAt,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: messageOf(error) });
    }
};
export const dismissMobileNotificationController = async (req, res) => {
    try {
        const r = req;
        const user = requireUser(r);
        const notificationId = String(req.params.notificationId ?? "");
        if (!isValidObjectId(notificationId)) {
            return res.status(400).json({ message: "Invalid notification id" });
        }
        const result = await dismissMobileNotification({ user, notificationId });
        return res.status(200).json(result);
    }
    catch (error) {
        const message = messageOf(error);
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(500).json({ message });
    }
};
//# sourceMappingURL=notificationController.js.map