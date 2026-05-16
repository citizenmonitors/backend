import Notification from "../../models/DailyTraffic/Notification.js";
import NewsInsight from "../../models/admin/NewsInsight.js";
import PressCoverage from "../../models/admin/PressCoverage.js";
import CollationDiscussionPost from "../../models/Election/CollationDiscussionPost.js";
import CollationDiscussionComment from "../../models/Election/CollationDiscussionComment.js";
import CollationReportComment from "../../models/Election/CollationReportComment.js";
import PulsePost from "../../models/Pulse/PulsePost.js";
import PulseComment from "../../models/Pulse/PulseComment.js";
import { getMobileLiveElectionsCarousel } from "./electionService.js";
import { getOrSetCache } from "../../utils/cache.js";
import { countCommentsForArticles } from "./newsInsightEngagementService.js";
import { countCommentsForPressCoverageArticles } from "./pressCoverageService.js";
const roleVisibilityFilter = (userId, role) => ({
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
const textPreview = (html, max) => {
    const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (plain.length <= max)
        return plain;
    return `${plain.slice(0, max)}…`;
};
const relativeTime = (date) => {
    if (!date)
        return "";
    const diff = Math.max(0, Date.now() - new Date(date).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1)
        return "just now";
    if (mins < 60)
        return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)
        return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
};
const normalizeLocationKey = (value) => String(value ?? "")
    .trim()
    .toLowerCase();
const buildPulseVisibilityFilter = (user) => {
    const state = normalizeLocationKey(user.state);
    const lga = normalizeLocationKey(user.lga);
    const ward = normalizeLocationKey(user.ward);
    if (!state || !lga)
        return null;
    return {
        $or: [
            {
                visibilityScope: "lga",
                audienceState: state,
                audienceLga: lga,
            },
            {
                visibilityScope: "ward",
                audienceState: state,
                audienceLga: lga,
                audienceWard: ward,
            },
        ],
    };
};
const resolveAuthorName = (author) => author?.firstName
    ? `${author.firstName} ${author.lastName ?? ""}`.trim()
    : author?.anonymousUsername
        ? `@${author.anonymousUsername}`
        : "Member";
const DASHBOARD_CACHE_TTL_SECONDS = 45;
const buildDashboardCacheKey = (user) => {
    const userId = String(user._id ?? "");
    const role = String(user.role ?? "");
    const state = normalizeLocationKey(user.state);
    const lga = normalizeLocationKey(user.lga);
    const ward = normalizeLocationKey(user.ward);
    return `mobile:dashboard:${userId}:${role}:${state}:${lga}:${ward}`;
};
const buildMobileDashboard = async (user) => {
    const userId = String(user._id ?? "");
    if (!userId)
        throw new Error("Authentication required");
    const role = String(user.role ?? "");
    const liveElections = await getMobileLiveElectionsCarousel(user);
    const liveIds = liveElections.map((e) => e.id);
    const pulseVisibility = buildPulseVisibilityFilter(user);
    const [electionNotifications, discussionPosts, pulsePosts, reportThreadComments, insights, pressCoverageFeed] = await Promise.all([
        Notification.find({
            ...roleVisibilityFilter(userId, role),
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
        pulseVisibility
            ? PulsePost.find(pulseVisibility)
                .populate("author", "firstName lastName anonymousUsername")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
            : Promise.resolve([]),
        liveIds.length
            ? CollationReportComment.find({ activeElection: { $in: liveIds } })
                .populate("author", "firstName lastName anonymousUsername")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
            : Promise.resolve([]),
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
            ? CollationDiscussionComment.aggregate([
                { $match: { post: { $in: discussionPosts.map((p) => p._id) } } },
                { $group: { _id: "$post", count: { $sum: 1 } } },
            ])
            : Promise.resolve([]),
        pulsePosts.length
            ? PulseComment.aggregate([
                { $match: { post: { $in: pulsePosts.map((p) => p._id) } } },
                { $group: { _id: "$post", count: { $sum: 1 } } },
            ])
            : Promise.resolve([]),
    ]);
    const discussionCommentCountByPost = new Map(discussionCommentCounts.map((entry) => [String(entry._id), entry.count]));
    const pulseCommentCountByPost = new Map(pulseCommentCounts.map((entry) => [String(entry._id), entry.count]));
    const insightIds = insights.map((i) => String(i._id));
    const newsInsightCommentCountByArticle = insightIds.length
        ? await countCommentsForArticles(insightIds)
        : new Map();
    const pressIds = pressCoverageFeed.map((p) => String(p._id));
    const pressCoverageCommentCountByArticle = pressIds.length
        ? await countCommentsForPressCoverageArticles(pressIds)
        : new Map();
    return {
        liveElections,
        electionUpdates: electionNotifications
            .map((n) => ({
            id: String(n._id),
            type: n.type,
            title: n.body ?? "",
            info: n.info ?? "",
            timeAgo: relativeTime(n.createdAt),
            createdAt: n.createdAt,
        }))
            .slice(0, 10),
        collationUpdates: discussionPosts.map((p) => {
            const author = p.author;
            return {
                id: String(p._id),
                source: "collation-discussion",
                activeElectionId: String(p.activeElection),
                body: p.body,
                imageUrl: Array.isArray(p.imageUrls) ? p.imageUrls[0] : undefined,
                likesCount: Array.isArray(p.likes) ? p.likes.length : 0,
                commentsCount: discussionCommentCountByPost.get(String(p._id)) ?? 0,
                authorName: resolveAuthorName(author),
                timeAgo: relativeTime(p.createdAt),
                createdAt: p.createdAt,
            };
        }),
        pulseAndDiscourse: [
            ...pulsePosts.map((p) => {
                const author = p.author;
                return {
                    id: String(p._id),
                    source: "pulse",
                    body: p.body,
                    imageUrl: p.imageUrl,
                    likesCount: Array.isArray(p.likes) ? p.likes.length : 0,
                    commentsCount: pulseCommentCountByPost.get(String(p._id)) ?? 0,
                    authorName: resolveAuthorName(author),
                    timeAgo: relativeTime(p.createdAt),
                    createdAt: p.createdAt,
                };
            }),
        ]
            .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
            .slice(0, 10),
        reportThreadUpdates: reportThreadComments.map((c) => {
            const author = c.author;
            return {
                id: String(c._id),
                targetType: c.targetType,
                targetId: String(c.targetId),
                activeElectionId: String(c.activeElection),
                body: c.body,
                likesCount: Array.isArray(c.likes) ? c.likes.length : 0,
                authorName: resolveAuthorName(author),
                timeAgo: relativeTime(c.createdAt),
                createdAt: c.createdAt,
            };
        }),
        latestNewsAndInsights: insights.map((i) => {
            const likes = Array.isArray(i.likes) ? i.likes : [];
            return {
                id: String(i._id),
                slug: i.slug,
                title: i.title,
                thumbnailURLUrl: i.thumbnailURLUrl,
                summary: (typeof i.excerpt === "string" ? i.excerpt.trim() : "") ||
                    textPreview(String(i.content ?? ""), 240),
                publishedAt: i.publishedAt,
                likesCount: likes.length,
                commentsCount: newsInsightCommentCountByArticle.get(String(i._id)) ?? 0,
                isLikedByCurrentUser: likes.some((l) => l.user != null && String(l.user) === userId),
            };
        }),
        pressCoverage: pressCoverageFeed.map((i) => {
            const likes = Array.isArray(i.likes) ? i.likes : [];
            return {
                id: String(i._id),
                slug: i.slug,
                title: i.title,
                thumbnailURL: i.thumbnailURL,
                summary: (typeof i.excerpt === "string" ? i.excerpt.trim() : "") ||
                    textPreview(String(i.content ?? ""), 240),
                publishedAt: i.publishedAt,
                dateline: typeof i.dateline === "string" ? i.dateline.trim() || undefined : undefined,
                likesCount: likes.length,
                commentsCount: pressCoverageCommentCountByArticle.get(String(i._id)) ?? 0,
                isLikedByCurrentUser: likes.some((l) => l.user != null && String(l.user) === userId),
            };
        }),
    };
};
export const getMobileDashboard = async (user) => {
    const cacheKey = buildDashboardCacheKey(user);
    return getOrSetCache(cacheKey, DASHBOARD_CACHE_TTL_SECONDS, () => buildMobileDashboard(user));
};
//# sourceMappingURL=dashboardService.js.map