import type { AuthenticatedUser } from "../../types/authenticatedRequest.ts";
import Notification from "../../models/DailyTraffic/Notification.ts";
import NewsInsight from "../../models/admin/NewsInsight.ts";
import PressCoverage from "../../models/admin/PressCoverage.ts";
import CollationDiscussionPost from "../../models/Election/CollationDiscussionPost.ts";
import CollationDiscussionComment from "../../models/Election/CollationDiscussionComment.ts";
import PulsePost from "../../models/Pulse/PulsePost.ts";
import PulseComment from "../../models/Pulse/PulseComment.ts";
import { buildViewerSafetyFilter } from "./pulseService.ts";
import { getMobileLiveElectionsCarousel } from "./electionService.ts";
import { getOrSetCache } from "../../utils/cache.ts";
import { buildHideConcludedElectionNotificationsFilter } from "../../utils/electionNotificationVisibility.ts";
import { sanitizeNotificationSubtitle } from "../../utils/notificationContent.ts";
import { countCommentsForArticles } from "./newsInsightEngagementService.ts";
import { countCommentsForPressCoverageArticles } from "./pressCoverageService.ts";
import { rewriteLegacyCoverUrl } from "../../utils/newsletterCover.ts";

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

const textPreview = (html: string, max: number): string => {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max)}…`;
};

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

const normalizeLocationKey = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();


/** Same rule as the Pulse feed: an anonymous post shows only the anonymous handle. */
const resolveAuthorName = (
  author:
    | { firstName?: string; lastName?: string; anonymousUsername?: string }
    | undefined,
  useAnonymousDisplay: boolean
): string => {
  if (useAnonymousDisplay && author?.anonymousUsername) return `@${author.anonymousUsername}`;
  const name = [author?.firstName, author?.lastName].filter(Boolean).join(" ").trim();
  return name || "Member";
};

const DASHBOARD_CACHE_TTL_SECONDS = 45;

const buildDashboardCacheKey = (user: AuthenticatedUser): string => {
  const userId = String(user._id ?? "");
  const role = String(user.role ?? "");
  const state = normalizeLocationKey((user as { state?: string | null }).state);
  const lga = normalizeLocationKey((user as { lga?: string | null }).lga);
  const ward = normalizeLocationKey((user as { ward?: string | null }).ward);
  return `mobile:dashboard:${userId}:${role}:${state}:${lga}:${ward}`;
};

const buildMobileDashboard = async (user: AuthenticatedUser) => {
  const userId = String(user._id ?? "");
  if (!userId) throw new Error("Authentication required");
  const role = String(user.role ?? "");

  const liveElections = await getMobileLiveElectionsCarousel(user);
  const liveIds = liveElections.map((e) => e.id);

  const [concludedElectionNotificationFilter, pulseSafety] = await Promise.all([
    buildHideConcludedElectionNotificationsFilter(),
    buildViewerSafetyFilter(userId),
  ]);
  const [electionNotifications, discussionPosts, pulsePosts, insights, pressCoverageFeed] =
    await Promise.all([
      Notification.find({
        $and: [
          roleVisibilityFilter(userId, role),
          concludedElectionNotificationFilter,
          {
            type: {
              $in: [
                "election-day-alert",
                "result-aggregated",
                "result-upload",
                "incident-upload",
                "report-confirmed",
                "report-flagged",
                "security-alert",
              ],
            },
          },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      liveIds.length
        ? CollationDiscussionPost.find({ activeElection: { $in: liveIds } })
            .populate("author", "firstName lastName anonymousUsername")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
        : Promise.resolve([]),
      PulsePost.find(pulseSafety.filter)
        .populate("author", "firstName lastName anonymousUsername")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      NewsInsight.find({
        isPublished: true,
      })
        .sort({ publishedAt: -1 })
        .limit(10)
        .select("slug title thumbnailURLUrl excerpt content publishedAt likes")
        .lean(),
      PressCoverage.find({
        isPublished: true,
      })
        .sort({ publishedAt: -1 })
        .limit(10)
        .select("slug title thumbnailURL excerpt content publishedAt likes dateline")
        .lean(),
    ]);

  const [discussionCommentCounts, pulseCommentCounts] = await Promise.all([
    discussionPosts.length
      ? CollationDiscussionComment.aggregate<{ _id: unknown; count: number }>([
          { $match: { post: { $in: discussionPosts.map((p) => p._id) } } },
          { $group: { _id: "$post", count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
    pulsePosts.length
      ? PulseComment.aggregate<{ _id: unknown; count: number }>([
          { $match: { post: { $in: pulsePosts.map((p) => p._id) } } },
          { $group: { _id: "$post", count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
  ]);

  const discussionCommentCountByPost = new Map(
    discussionCommentCounts.map((entry) => [String(entry._id), entry.count])
  );
  const pulseCommentCountByPost = new Map(
    pulseCommentCounts.map((entry) => [String(entry._id), entry.count])
  );

  const insightIds = insights.map((i) => String(i._id));
  const newsInsightCommentCountByArticle = insightIds.length
    ? await countCommentsForArticles(insightIds)
    : new Map<string, number>();

  const pressIds = pressCoverageFeed.map((p) => String(p._id));
  const pressCoverageCommentCountByArticle = pressIds.length
    ? await countCommentsForPressCoverageArticles(pressIds)
    : new Map<string, number>();

  return {
    liveElections,
    electionUpdates: electionNotifications
      .map((n) => ({
        id: String(n._id),
        type: n.type,
        title: n.body ?? "",
        info: sanitizeNotificationSubtitle(n.info) || String(n.info ?? ""),
        timeAgo: relativeTime(n.createdAt),
        createdAt: n.createdAt,
      }))
      .slice(0, 10),
    collationUpdates: discussionPosts.map((p) => {
      const author = p.author as
        | { firstName?: string; lastName?: string; anonymousUsername?: string }
        | undefined;
      return {
        id: String(p._id),
        source: "collation-discussion",
        activeElectionId: String(p.activeElection),
        body: p.body,
        imageUrl: Array.isArray(p.imageUrls) ? p.imageUrls[0] : undefined,
        likesCount: Array.isArray(p.likes) ? p.likes.length : 0,
        commentsCount: discussionCommentCountByPost.get(String(p._id)) ?? 0,
        authorName: resolveAuthorName(author, Boolean(p.useAnonymousDisplay)),
        timeAgo: relativeTime(p.createdAt),
        createdAt: p.createdAt,
      };
    }),
    pulseAndDiscourse: [
      ...pulsePosts.map((p) => {
        const author = p.author as
          | { firstName?: string; lastName?: string; anonymousUsername?: string }
          | undefined;
        return {
          id: String(p._id),
          source: "pulse",
          body: p.body,
          imageUrl: p.imageUrl,
          likesCount: Array.isArray(p.likes) ? p.likes.length : 0,
          commentsCount: pulseCommentCountByPost.get(String(p._id)) ?? 0,
          authorName: resolveAuthorName(author, Boolean(p.useAnonymousDisplay)),
          timeAgo: relativeTime(p.createdAt),
          createdAt: p.createdAt,
        };
      }),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
      .slice(0, 10),
    latestNewsAndInsights: insights.map((i) => {
      const likes = Array.isArray(i.likes) ? i.likes : [];
      return {
        id: String(i._id),
        slug: i.slug,
        title: i.title,
        thumbnailURLUrl: rewriteLegacyCoverUrl(String(i.thumbnailURLUrl ?? "")),
        summary:
          (typeof i.excerpt === "string" ? i.excerpt.trim() : "") ||
          textPreview(String(i.content ?? ""), 240),
        publishedAt: i.publishedAt,
        likesCount: likes.length,
        commentsCount: newsInsightCommentCountByArticle.get(String(i._id)) ?? 0,
        isLikedByCurrentUser: likes.some(
          (l: { user?: unknown }) => l.user != null && String(l.user) === userId
        ),
      };
    }),
    pressCoverage: pressCoverageFeed.map((i) => {
      const likes = Array.isArray(i.likes) ? i.likes : [];
      return {
        id: String(i._id),
        slug: i.slug,
        title: i.title,
        thumbnailURL: i.thumbnailURL,
        summary:
          (typeof i.excerpt === "string" ? i.excerpt.trim() : "") ||
          textPreview(String(i.content ?? ""), 240),
        publishedAt: i.publishedAt,
        dateline: typeof i.dateline === "string" ? i.dateline.trim() || undefined : undefined,
        likesCount: likes.length,
        commentsCount: pressCoverageCommentCountByArticle.get(String(i._id)) ?? 0,
        isLikedByCurrentUser: likes.some(
          (l: { user?: unknown }) => l.user != null && String(l.user) === userId
        ),
      };
    }),
  };
};

export const getMobileDashboard = async (user: AuthenticatedUser) => {
  const cacheKey = buildDashboardCacheKey(user);
  return getOrSetCache(cacheKey, DASHBOARD_CACHE_TTL_SECONDS, () =>
    buildMobileDashboard(user)
  );
};
