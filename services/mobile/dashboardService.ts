import type { AuthenticatedUser } from "../../types/authenticatedRequest.ts";
import Notification from "../../models/DailyTraffic/Notification.ts";
import Podcast from "../../models/admin/Podcast.ts";
import CollationDiscussionPost from "../../models/Election/CollationDiscussionPost.ts";
import { getMobileLiveElectionsCarousel } from "./electionService.ts";

const roleVisibilityFilter = (userId: string, role: string) => ({
  $and: [
    {
      $or: [
        { recipients: { $exists: false } },
        { recipients: { $size: 0 } },
        { recipients: "all" },
        { recipients: role },
      ],
    },
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

const relativeTime = (date: Date | undefined): string => {
  if (!date) return "";
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export const getMobileDashboard = async (user: AuthenticatedUser) => {
  const userId = String(user._id ?? "");
  if (!userId) throw new Error("Authentication required");
  const role = String(user.role ?? "");

  const liveElections = await getMobileLiveElectionsCarousel(user);
  const liveIds = liveElections.map((e) => e.id);

  const [electionNotifications, collationNotifications, discussions, insights] =
    await Promise.all([
      Notification.find({
        ...roleVisibilityFilter(userId, role),
        type: { $in: ["election-day-alert", "result-aggregated"] },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Notification.find({
        ...roleVisibilityFilter(userId, role),
        type: {
          $in: [
            "result-upload",
            "incident-upload",
            "report-confirmed",
            "report-flagged",
            "security-alert",
          ],
        },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      liveIds.length
        ? CollationDiscussionPost.find({ activeElection: { $in: liveIds } })
            .populate("author", "firstName lastName anonymousUsername")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
        : Promise.resolve([]),
      Podcast.find({
        recipients: { $in: ["all", role] },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

  return {
    liveElections,
    electionUpdates: electionNotifications.map((n) => ({
      id: String(n._id),
      type: n.type,
      title: n.body ?? "",
      info: n.info ?? "",
      timeAgo: relativeTime(n.createdAt),
      createdAt: n.createdAt,
    })),
    collationUpdates: collationNotifications.map((n) => ({
      id: String(n._id),
      type: n.type,
      title: n.body ?? "",
      info: n.info ?? "",
      timeAgo: relativeTime(n.createdAt),
      createdAt: n.createdAt,
    })),
    pulseAndDiscourse: discussions.map((p) => {
      const author = p.author as
        | { firstName?: string; lastName?: string; anonymousUsername?: string }
        | undefined;
      const authorName = author?.firstName
        ? `${author.firstName} ${author.lastName ?? ""}`.trim()
        : author?.anonymousUsername
          ? `@${author.anonymousUsername}`
          : "Member";
      return {
        id: String(p._id),
        activeElectionId: String(p.activeElection),
        body: p.body,
        imageUrl: Array.isArray(p.imageUrls) ? p.imageUrls[0] : undefined,
        likesCount: Array.isArray(p.likes) ? p.likes.length : 0,
        commentsCount: 0,
        authorName,
        timeAgo: relativeTime(p.createdAt),
        createdAt: p.createdAt,
      };
    }),
    latestNewsAndInsights: insights.map((i) => ({
      id: String(i._id),
      title: i.title,
      content: i.content,
      publishedAt: i.createdAt,
    })),
  };
};
