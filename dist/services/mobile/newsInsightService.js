import NewsInsight from "../../models/admin/NewsInsight.js";
import NewsInsightComment from "../../models/admin/NewsInsightComment.js";
import { countCommentsForArticles } from "./newsInsightEngagementService.js";
const textPreview = (html, max) => {
    const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (plain.length <= max)
        return plain;
    return `${plain.slice(0, max)}…`;
};
const likesArray = (row) => Array.isArray(row.likes) ? row.likes : [];
export const listPublishedNewsInsightsMobile = async (input) => {
    const page = Math.max(1, input?.page ?? 1);
    const limit = Math.min(50, Math.max(1, input?.limit ?? 20));
    const skip = (page - 1) * limit;
    const viewerId = input?.viewerUserId;
    const filter = { isPublished: true };
    const [rows, total] = await Promise.all([
        NewsInsight.find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("slug title thumbnailUrl publishedAt excerpt content likes")
            .lean(),
        NewsInsight.countDocuments(filter),
    ]);
    const ids = rows.map((row) => String(row._id));
    const commentCountByArticle = await countCommentsForArticles(ids);
    return {
        total,
        page,
        limit,
        items: rows.map((row) => {
            const likes = likesArray(row);
            return {
                id: String(row._id),
                slug: row.slug,
                title: row.title,
                thumbnailUrl: row.thumbnailUrl,
                summary: row.excerpt?.trim() || textPreview(String(row.content ?? ""), 220),
                publishedAt: row.publishedAt,
                likesCount: likes.length,
                commentsCount: commentCountByArticle.get(String(row._id)) ?? 0,
                isLikedByCurrentUser: viewerId
                    ? likes.some((l) => l.user != null && String(l.user) === viewerId)
                    : false,
            };
        }),
    };
};
export const getPublishedNewsInsightBySlugMobile = async (slug, viewerUserId) => {
    const normalized = slug.trim().toLowerCase();
    const row = await NewsInsight.findOne({
        slug: normalized,
        isPublished: true,
    })
        .select("slug title excerpt content thumbnailUrl heroImageUrl publishedAt createdAt likes")
        .lean();
    if (!row)
        return null;
    const hero = row.heroImageUrl?.trim() || row.thumbnailUrl;
    const likes = likesArray(row);
    const commentsCount = await NewsInsightComment.countDocuments({ article: row._id });
    return {
        id: String(row._id),
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt?.trim() || textPreview(String(row.content ?? ""), 280),
        content: row.content,
        thumbnailUrl: row.thumbnailUrl,
        heroImageUrl: hero,
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
        likesCount: likes.length,
        commentsCount,
        isLikedByCurrentUser: viewerUserId
            ? likes.some((l) => l.user != null && String(l.user) === viewerUserId)
            : false,
    };
};
//# sourceMappingURL=newsInsightService.js.map