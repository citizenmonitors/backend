import CompletedUser from "../../models/CompletedUser.ts";
import Notification from "../../models/DailyTraffic/Notification.ts";
import { isActiveElectionConcludedById } from "../../utils/electionNotificationVisibility.ts";
import {
  defaultNotificationSubtitle,
  sanitizeNotificationSubtitle,
} from "../../utils/notificationContent.ts";
import { invalidateAllMobileReadCaches } from "../../utils/cache.ts";
import { getSocketServer } from "../realtime/socketBus.ts";
import { userRoomName } from "../realtime/socketServer.ts";
import { sendPushForMobileNotification } from "./pushNotificationService.ts";

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
    info:
      sanitizeNotificationSubtitle(input.notification.info) ||
      defaultNotificationSubtitle(input.notification.type),
    createdAt: input.notification.createdAt ?? new Date(),
  };

  for (const userId of input.targetUserIds) {
    io.to(userRoomName(userId)).emit("notification:new", payload);
  }
};

const deliverNotification = async (
  notification: {
    _id: unknown;
    type?: string | null;
    preferenceKey?: string | null;
    body?: string | null;
    info?: string | null;
    createdAt?: Date | string;
  },
  targetUserIds: string[]
): Promise<void> => {
  const userIds = targetUserIds.map(String);
  emitRealtimeNotification({ notification, targetUserIds: userIds });
  await sendPushForMobileNotification({ notification, userIds }).catch((error) => {
    console.error("Mobile push delivery failed:", error);
  });
  await invalidateAllMobileReadCaches();
};

const filterUsersByPreference = (
  users: Array<{ _id: unknown; role?: string | null; notifications?: unknown }>,
  preferenceKey: MobileNotificationPreferenceKey,
  respectPreferences: boolean
) => {
  if (!respectPreferences) {
    return users.map((user) => user._id);
  }
  return users
    .filter((user) => {
      const mobilePrefs = ((user.notifications as { mobile?: MobilePrefState } | undefined)?.mobile ??
        {}) as MobilePrefState;
      const resolved = withDefaults(user.role ?? undefined, mobilePrefs);
      return Boolean(resolved[preferenceKey]);
    })
    .map((user) => user._id);
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
  articleSlug?: string;
  articleId?: string;
  activeElectionId?: string;
  recipients: RecipientRole[];
  audienceQuery?: Record<string, unknown>;
  /** When false, delivers to all matched users regardless of notification prefs (transactional). */
  respectPreferences?: boolean;
}) => {
  if (
    input.activeElectionId &&
    (await isActiveElectionConcludedById(input.activeElectionId))
  ) {
    return null;
  }

  const respectPreferences = input.respectPreferences ?? true;
  const users = await CompletedUser.find(
    { ...roleFilter(input.recipients), ...(input.audienceQuery ?? {}) },
    "_id role notifications.mobile"
  ).lean();

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
    activeElectionId: input.activeElectionId,
    recipients: input.recipients,
    targetUsers,
  });
  await deliverNotification(notification, targetUsers.map((id) => String(id)));
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
  articleSlug?: string;
  articleId?: string;
  activeElectionId?: string;
  userIds: Array<string>;
  respectPreferences?: boolean;
}) => {
  const ids = Array.from(new Set(input.userIds.filter(Boolean)));
  if (ids.length === 0) return null;

  if (
    input.activeElectionId &&
    (await isActiveElectionConcludedById(input.activeElectionId))
  ) {
    return null;
  }

  const respectPreferences = input.respectPreferences ?? true;
  const users = await CompletedUser.find(
    { _id: { $in: ids } },
    "_id role notifications.mobile"
  ).lean();
  const targetUsers = filterUsersByPreference(users, input.preferenceKey, respectPreferences);

  if (targetUsers.length === 0) return null;

  const notification = await Notification.create({
    type: input.type,
    preferenceKey: input.preferenceKey,
    body: input.body,
    info: input.info,
    articleSlug: input.articleSlug,
    articleId: input.articleId,
    activeElectionId: input.activeElectionId,
    targetUsers,
  });
  await deliverNotification(notification, targetUsers.map((id) => String(id)));
  return notification;
};
