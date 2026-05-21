import Notification from "../../models/DailyTraffic/Notification.ts";
import type { AuthenticatedUser } from "../../types/authenticatedRequest.ts";

const toStringId = (value: unknown): string => String(value);

const buildRoleRecipientFilter = (role: string) => ({
  $or: [
    { recipients: { $exists: false } },
    { recipients: { $size: 0 } },
    { recipients: "all" },
    { recipients: role },
  ],
});

const baseVisibilityFilter = (userId: string, role: string) => ({
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

const mapNotification = (
  row: {
    _id: unknown;
    type?: string | null;
    body?: string | null;
    info?: string | null;
    createdAt?: Date;
    readBy?: unknown[];
  },
  userId: string
) => {
  const readBy = Array.isArray(row.readBy) ? row.readBy.map(toStringId) : [];
  const isRead = readBy.includes(userId);
  return {
    id: String(row._id),
    type: row.type ?? "general",
    title: row.body ?? "",
    message: row.body ?? "",
    info: row.info ?? "",
    createdAt: row.createdAt,
    isRead,
  };
};

export const getMobileNotifications = async (input: {
  user: AuthenticatedUser;
  page?: number;
  limit?: number;
}) => {
  const userId = String(input.user._id ?? "");
  if (!userId) throw new Error("Authentication required");
  const role = String(input.user.role ?? "");
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(50, Math.max(1, input.limit ?? 20));
  const skip = (page - 1) * limit;

  const visibility = baseVisibilityFilter(userId, role);

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

export const getMobileNotificationDetail = async (input: {
  user: AuthenticatedUser;
  notificationId: string;
}) => {
  const userId = String(input.user._id ?? "");
  if (!userId) throw new Error("Authentication required");
  const role = String(input.user.role ?? "");

  const visibility = baseVisibilityFilter(userId, role);
  const notification = await Notification.findOne({
    _id: input.notificationId,
    ...visibility,
  });
  if (!notification) throw new Error("Notification not found");

  if (!notification.readBy.some((id) => String(id) === userId)) {
    notification.readBy.push(userId as never);
    await notification.save();
  }

  const row = notification.toObject();
  return mapNotification(row, userId);
};

export const markMobileNotificationRead = async (input: {
  user: AuthenticatedUser;
  notificationId: string;
}) => {
  const userId = String(input.user._id ?? "");
  if (!userId) throw new Error("Authentication required");
  const role = String(input.user.role ?? "");

  const visibility = baseVisibilityFilter(userId, role);
  const notification = await Notification.findOne({
    _id: input.notificationId,
    ...visibility,
  });
  if (!notification) throw new Error("Notification not found");

  await Notification.updateOne(
    { _id: input.notificationId },
    { $addToSet: { readBy: userId } }
  );

  return { message: "Notification marked as read" };
};

export const markAllMobileNotificationsRead = async (input: {
  user: AuthenticatedUser;
}) => {
  const userId = String(input.user._id ?? "");
  if (!userId) throw new Error("Authentication required");
  const role = String(input.user.role ?? "");
  const visibility = baseVisibilityFilter(userId, role);

  await Notification.updateMany(visibility, { $addToSet: { readBy: userId } });
  return { message: "All notifications marked as read" };
};

export const dismissMobileNotification = async (input: {
  user: AuthenticatedUser;
  notificationId: string;
}) => {
  const userId = String(input.user._id ?? "");
  if (!userId) throw new Error("Authentication required");
  const role = String(input.user.role ?? "");

  const visibility = baseVisibilityFilter(userId, role);
  const notification = await Notification.findOne({
    _id: input.notificationId,
    ...visibility,
  });
  if (!notification) throw new Error("Notification not found");

  await Notification.updateOne(
    { _id: input.notificationId },
    { $addToSet: { deletedBy: userId, readBy: userId } }
  );

  return { message: "Notification removed from inbox" };
};
