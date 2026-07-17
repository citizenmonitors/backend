import Notification from "../../models/DailyTraffic/Notification.js";
import { buildHideConcludedElectionNotificationsFilter } from "../../utils/electionNotificationVisibility.js";
import { resolveNotificationDisplay } from "../../utils/notificationContent.js";
const toStringId = (value) => String(value);
const buildRoleRecipientFilter = (role) => ({
    $or: [
        { recipients: { $exists: false } },
        { recipients: { $size: 0 } },
        { recipients: "all" },
        { recipients: role },
    ],
});
const baseVisibilityFilter = (userId, role) => ({
    $and: [
        buildRoleRecipientFilter(role),
        {
            $or: [
                { targetUsers: { $exists: false } },
                { targetUsers: { $size: 0 } },
                { targetUsers: userId },
            ],
        },
        { deletedBy: { $ne: userId } },
    ],
});
const mapNotification = (row, userId) => {
    const readBy = Array.isArray(row.readBy) ? row.readBy.map(toStringId) : [];
    const isRead = readBy.includes(userId);
    const { title, subtitle, link } = resolveNotificationDisplay(row);
    return {
        id: String(row._id),
        type: row.type ?? "general",
        title,
        message: title,
        info: subtitle,
        articleSlug: link?.slug ?? null,
        articleId: link?.articleId ?? null,
        createdAt: row.createdAt,
        isRead,
    };
};
export const getMobileNotifications = async (input) => {
    const userId = String(input.user._id ?? "");
    if (!userId)
        throw new Error("Authentication required");
    const role = String(input.user.role ?? "");
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(50, Math.max(1, input.limit ?? 20));
    const skip = (page - 1) * limit;
    const electionVisibility = await buildHideConcludedElectionNotificationsFilter();
    const visibility = {
        $and: [baseVisibilityFilter(userId, role), electionVisibility],
    };
    const [rows, total, unreadCount] = await Promise.all([
        Notification.find(visibility)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments(visibility),
        Notification.countDocuments({ ...visibility, readBy: { $ne: userId } }),
    ]);
    return {
        total,
        page,
        limit,
        unreadCount,
        notifications: rows.map((row) => mapNotification(row, userId)),
    };
};
export const getMobileNotificationDetail = async (input) => {
    const userId = String(input.user._id ?? "");
    if (!userId)
        throw new Error("Authentication required");
    const role = String(input.user.role ?? "");
    const electionVisibility = await buildHideConcludedElectionNotificationsFilter();
    const visibility = {
        $and: [baseVisibilityFilter(userId, role), electionVisibility],
    };
    const notification = await Notification.findOne({
        _id: input.notificationId,
        ...visibility,
    });
    if (!notification)
        throw new Error("Notification not found");
    if (!notification.readBy.some((id) => String(id) === userId)) {
        notification.readBy.push(userId);
        await notification.save();
    }
    const row = notification.toObject();
    return mapNotification(row, userId);
};
export const markMobileNotificationRead = async (input) => {
    const userId = String(input.user._id ?? "");
    if (!userId)
        throw new Error("Authentication required");
    const role = String(input.user.role ?? "");
    const electionVisibility = await buildHideConcludedElectionNotificationsFilter();
    const visibility = {
        $and: [baseVisibilityFilter(userId, role), electionVisibility],
    };
    const notification = await Notification.findOne({
        _id: input.notificationId,
        ...visibility,
    });
    if (!notification)
        throw new Error("Notification not found");
    await Notification.updateOne({ _id: input.notificationId }, { $addToSet: { readBy: userId } });
    return { message: "Notification marked as read" };
};
export const markAllMobileNotificationsRead = async (input) => {
    const userId = String(input.user._id ?? "");
    if (!userId)
        throw new Error("Authentication required");
    const role = String(input.user.role ?? "");
    const electionVisibility = await buildHideConcludedElectionNotificationsFilter();
    const visibility = {
        $and: [baseVisibilityFilter(userId, role), electionVisibility],
    };
    await Notification.updateMany(visibility, { $addToSet: { readBy: userId } });
    return { message: "All notifications marked as read" };
};
export const dismissMobileNotification = async (input) => {
    const userId = String(input.user._id ?? "");
    if (!userId)
        throw new Error("Authentication required");
    const role = String(input.user.role ?? "");
    const electionVisibility = await buildHideConcludedElectionNotificationsFilter();
    const visibility = {
        $and: [baseVisibilityFilter(userId, role), electionVisibility],
    };
    const notification = await Notification.findOne({
        _id: input.notificationId,
        ...visibility,
    });
    if (!notification)
        throw new Error("Notification not found");
    await Notification.updateOne({ _id: input.notificationId }, { $addToSet: { deletedBy: userId, readBy: userId } });
    return { message: "Notification removed from inbox" };
};
//# sourceMappingURL=notificationService.js.map