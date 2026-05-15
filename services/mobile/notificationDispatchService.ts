import CompletedUser from "../../models/CompletedUser.ts";
import Notification from "../../models/DailyTraffic/Notification.ts";
import { invalidateAllMobileReadCaches } from "../../utils/cache.ts";
import { getSocketServer } from "../realtime/socketBus.ts";
import { userRoomName } from "../realtime/socketServer.ts";

export type MobileNotificationPreferenceKey =
  | "pollingUnitActivity"
  | "electionDayAlert"
  | "discussionReplies"
  | "resultAggregated"
  | "reportConfirmed"
  | "reportFlagged"
  | "securityAlerts"
  | "newsletter"
  | "newsAndInsights"
  | "pressCoverage";

type RecipientRole =
  | "all"
  | "observer"
  | "volunteer"
  | "public-viewer"
  | "admin"
  | "super-admin";

type MobilePrefState = Partial<Record<MobileNotificationPreferenceKey, boolean>>;

const withDefaults = (role: string | undefined, current: MobilePrefState): Required<MobilePrefState> => ({
  pollingUnitActivity: current.pollingUnitActivity ?? true,
  electionDayAlert: current.electionDayAlert ?? false,
  discussionReplies: current.discussionReplies ?? false,
  resultAggregated: current.resultAggregated ?? false,
  reportConfirmed: current.reportConfirmed ?? false,
  reportFlagged: current.reportFlagged ?? role === "observer",
  securityAlerts: current.securityAlerts ?? false,
  newsletter: current.newsletter ?? true,
  newsAndInsights: current.newsAndInsights ?? true,
  pressCoverage: current.pressCoverage ?? true,
});

const roleFilter = (recipients: RecipientRole[]) => {
  if (recipients.includes("all")) {
    return {
      role: { $in: ["observer", "volunteer", "public-viewer", "admin", "super-admin"] },
    };
  }
  return { role: { $in: recipients } };
};

const emitRealtimeNotification = (input: {
  notification: {
    _id: unknown;
    type?: string | null;
    preferenceKey?: string | null;
    body?: string | null;
    info?: string | null;
    createdAt?: Date | string;
  };
  targetUserIds: string[];
}): void => {
  const io = getSocketServer();
  if (!io) return;

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

export const dispatchMobileNotification = async (input: {
  type:
    | "result-upload"
    | "incident-upload"
    | "pending-approval"
    | "security-alert"
    | "discussion-reply"
    | "result-aggregated"
    | "report-confirmed"
    | "report-flagged"
    | "newsletter"
    | "election-day-alert"
    | "news-insight"
    | "press-coverage";
  preferenceKey: MobileNotificationPreferenceKey;
  body: string;
  info?: string;
  recipients: RecipientRole[];
  audienceQuery?: Record<string, unknown>;
}) => {
  const users = await CompletedUser.find(
    { ...roleFilter(input.recipients), ...(input.audienceQuery ?? {}) },
    "_id role notifications.mobile"
  ).lean();

  const targetUsers = users
    .filter((user) => {
      const mobilePrefs = ((user.notifications as { mobile?: MobilePrefState } | undefined)?.mobile ??
        {}) as MobilePrefState;
      const resolved = withDefaults(user.role ?? undefined, mobilePrefs);
      return Boolean(resolved[input.preferenceKey]);
    })
    .map((user) => user._id);

  if (targetUsers.length === 0) {
    return null;
  }

  const notification = await Notification.create({
    type: input.type,
    preferenceKey: input.preferenceKey,
    body: input.body,
    info: input.info,
    recipients: input.recipients,
    targetUsers,
  });
  emitRealtimeNotification({
    notification,
    targetUserIds: targetUsers.map((id) => String(id)),
  });
  await invalidateAllMobileReadCaches();
  return notification;
};

export const dispatchNotificationToUsers = async (input: {
  type:
    | "result-upload"
    | "incident-upload"
    | "pending-approval"
    | "security-alert"
    | "discussion-reply"
    | "result-aggregated"
    | "report-confirmed"
    | "report-flagged"
    | "newsletter"
    | "election-day-alert"
    | "news-insight"
    | "press-coverage";
  preferenceKey: MobileNotificationPreferenceKey;
  body: string;
  info?: string;
  userIds: Array<string>;
}) => {
  const ids = Array.from(new Set(input.userIds.filter(Boolean)));
  if (ids.length === 0) return null;

  const users = await CompletedUser.find(
    { _id: { $in: ids } },
    "_id role notifications.mobile"
  ).lean();
  const targetUsers = users
    .filter((user) => {
      const mobilePrefs = ((user.notifications as { mobile?: MobilePrefState } | undefined)?.mobile ??
        {}) as MobilePrefState;
      const resolved = withDefaults(user.role ?? undefined, mobilePrefs);
      return Boolean(resolved[input.preferenceKey]);
    })
    .map((user) => user._id);

  if (targetUsers.length === 0) return null;

  const notification = await Notification.create({
    type: input.type,
    preferenceKey: input.preferenceKey,
    body: input.body,
    info: input.info,
    targetUsers,
  });
  emitRealtimeNotification({
    notification,
    targetUserIds: targetUsers.map((id) => String(id)),
  });
  await invalidateAllMobileReadCaches();
  return notification;
};
