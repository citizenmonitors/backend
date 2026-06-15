import CompletedUser from "../../models/CompletedUser.js";
import Notification from "../../models/DailyTraffic/Notification.js";
import { invalidateAllMobileReadCaches } from "../../utils/cache.js";
import { getSocketServer } from "../realtime/socketBus.js";
import { userRoomName } from "../realtime/socketServer.js";
import { sendPushForMobileNotification } from "./pushNotificationService.js";
const withDefaults = (role, current) => ({
    pollingUnitActivity: current.pollingUnitActivity ?? true,
    electionDayAlert: current.electionDayAlert ?? true,
    discussionReplies: current.discussionReplies ?? true,
    resultAggregated: current.resultAggregated ?? true,
    reportConfirmed: current.reportConfirmed ?? false,
    reportFlagged: current.reportFlagged ?? role === "observer",
    securityAlerts: current.securityAlerts ?? false,
    newsletter: current.newsletter ?? true,
    newsAndInsights: current.newsAndInsights ?? true,
    pressCoverage: current.pressCoverage ?? true,
});
const roleFilter = (recipients) => {
    if (recipients.includes("all")) {
        return {
            role: { $in: ["observer", "volunteer", "public-viewer", "admin", "super-admin"] },
        };
    }
    return { role: { $in: recipients } };
};
const emitRealtimeNotification = (input) => {
    const io = getSocketServer();
    if (!io)
        return;
    const payload = {
        id: String(input.notification._id),
        type: input.notification.type,
        preferenceKey: input.notification.preferenceKey,
        body: input.notification.body,
        info: input.notification.info,
        createdAt: input.notification.createdAt ?? new Date(),
    };
    for (const userId of input.targetUserIds) {
        io.to(userRoomName(userId)).emit("notification:new", payload);
    }
};
const deliverNotification = async (notification, targetUserIds) => {
    const userIds = targetUserIds.map(String);
    emitRealtimeNotification({ notification, targetUserIds: userIds });
    await sendPushForMobileNotification({ notification, userIds }).catch((error) => {
        console.error("Mobile push delivery failed:", error);
    });
    await invalidateAllMobileReadCaches();
};
const filterUsersByPreference = (users, preferenceKey, respectPreferences) => {
    if (!respectPreferences) {
        return users.map((user) => user._id);
    }
    return users
        .filter((user) => {
        const mobilePrefs = (user.notifications?.mobile ??
            {});
        const resolved = withDefaults(user.role ?? undefined, mobilePrefs);
        return Boolean(resolved[preferenceKey]);
    })
        .map((user) => user._id);
};
export const dispatchMobileNotification = async (input) => {
    const respectPreferences = input.respectPreferences ?? true;
    const users = await CompletedUser.find({ ...roleFilter(input.recipients), ...(input.audienceQuery ?? {}) }, "_id role notifications.mobile").lean();
    const targetUsers = filterUsersByPreference(users, input.preferenceKey, respectPreferences);
    if (targetUsers.length === 0) {
        return null;
    }
    const notification = await Notification.create({
        type: input.type,
        preferenceKey: input.preferenceKey,
        body: input.body,
        info: input.info,
        articleSlug: input.articleSlug,
        articleId: input.articleId,
        recipients: input.recipients,
        targetUsers,
    });
    await deliverNotification(notification, targetUsers.map((id) => String(id)));
    return notification;
};
export const dispatchNotificationToUsers = async (input) => {
    const ids = Array.from(new Set(input.userIds.filter(Boolean)));
    if (ids.length === 0)
        return null;
    const respectPreferences = input.respectPreferences ?? true;
    const users = await CompletedUser.find({ _id: { $in: ids } }, "_id role notifications.mobile").lean();
    const targetUsers = filterUsersByPreference(users, input.preferenceKey, respectPreferences);
    if (targetUsers.length === 0)
        return null;
    const notification = await Notification.create({
        type: input.type,
        preferenceKey: input.preferenceKey,
        body: input.body,
        info: input.info,
        articleSlug: input.articleSlug,
        articleId: input.articleId,
        targetUsers,
    });
    await deliverNotification(notification, targetUsers.map((id) => String(id)));
    return notification;
};
//# sourceMappingURL=notificationDispatchService.js.map