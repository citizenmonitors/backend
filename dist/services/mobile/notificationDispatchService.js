import CompletedUser from "../../models/CompletedUser.js";
import Notification from "../../models/DailyTraffic/Notification.js";
const withDefaults = (role, current) => ({
    pollingUnitActivity: current.pollingUnitActivity ?? true,
    electionDayAlert: current.electionDayAlert ?? false,
    discussionReplies: current.discussionReplies ?? false,
    resultAggregated: current.resultAggregated ?? false,
    reportConfirmed: current.reportConfirmed ?? false,
    reportFlagged: current.reportFlagged ?? role === "observer",
    securityAlerts: current.securityAlerts ?? false,
    newsletter: current.newsletter ?? true,
});
const roleFilter = (recipients) => {
    if (recipients.includes("all")) {
        return {
            role: { $in: ["observer", "volunteer", "public-viewer", "admin", "super-admin"] },
        };
    }
    return { role: { $in: recipients } };
};
export const dispatchMobileNotification = async (input) => {
    const users = await CompletedUser.find({ ...roleFilter(input.recipients), ...(input.audienceQuery ?? {}) }, "_id role notifications.mobile").lean();
    const targetUsers = users
        .filter((user) => {
        const mobilePrefs = (user.notifications?.mobile ??
            {});
        const resolved = withDefaults(user.role ?? undefined, mobilePrefs);
        return Boolean(resolved[input.preferenceKey]);
    })
        .map((user) => user._id);
    if (targetUsers.length === 0) {
        return null;
    }
    return Notification.create({
        type: input.type,
        preferenceKey: input.preferenceKey,
        body: input.body,
        info: input.info,
        recipients: input.recipients,
        targetUsers,
    });
};
export const dispatchNotificationToUsers = async (input) => {
    const ids = Array.from(new Set(input.userIds.filter(Boolean)));
    if (ids.length === 0)
        return null;
    const users = await CompletedUser.find({ _id: { $in: ids } }, "_id role notifications.mobile").lean();
    const targetUsers = users
        .filter((user) => {
        const mobilePrefs = (user.notifications?.mobile ??
            {});
        const resolved = withDefaults(user.role ?? undefined, mobilePrefs);
        return Boolean(resolved[input.preferenceKey]);
    })
        .map((user) => user._id);
    if (targetUsers.length === 0)
        return null;
    return Notification.create({
        type: input.type,
        preferenceKey: input.preferenceKey,
        body: input.body,
        info: input.info,
        targetUsers,
    });
};
//# sourceMappingURL=notificationDispatchService.js.map