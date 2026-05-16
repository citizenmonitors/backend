import NewsInsight from "../../models/admin/NewsInsight.js";
import NewsInsightComment from "../../models/admin/NewsInsightComment.js";
import { countCommentsForArticles } from "./newsInsightEngagementService.js";
const likesArray = (row) => Array.isArray(row.likes) ? row.likes : [];
const resolveHeroImageURL = (row) => {
    const hero = row.heroImageURL?.trim() ||
        row.heroImageURLUrl?.trim() ||
        "";
    return hero || row.thumbnailURLUrl;
};
const toNewsInsightMobileArticle = (row, input) => {
    const likes = likesArray(row);
    const heroImageURL = resolveHeroImageURL(row);
    return {
        id: String(row._id),
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt?.trim() || undefined,
        content: row.content,
        thumbnailURLUrl: row.thumbnailURLUrl,
        heroImageURL,
        publishedAt: row.publishedAt,
        isPublished: row.isPublished ?? true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        likesCount: likes.length,
        commentsCount: input.commentsCount,
        isLikedByCurrentUser: input.viewerUserId
            ? likes.some((l) => l.user != null && String(l.user) === input.viewerUserId)
            : false,
    };
};
export const listPublishedNewsInsightsMobile = async (input) => {
    const page = Math.max(1, input?.page ?? 1);
    const limit = Math.min(50, Math.max(1, input?.limit ?? 20));
    const skip = (page - 1) * limit;
    const viewerId = input?.viewerUserId;
    const filter = { isPublished: true };
    const [rows, total] = await Promise.all([
        NewsInsight.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
        NewsInsight.countDocuments(filter),
    ]);
    const ids = rows.map((row) => String(row._id));
    const commentCountByArticle = await countCommentsForArticles(ids);
    return {
        total,
        page,
        limit,
        items: rows.map((row) => toNewsInsightMobileArticle(row, {
            viewerUserId: viewerId,
            commentsCount: commentCountByArticle.get(String(row._id)) ?? 0,
        })),
    };
};
export const getPublishedNewsInsightBySlugMobile = async (slug, viewerUserId) => {
    const normalized = slug.trim().toLowerCase();
    const row = await NewsInsight.findOne({
        slug: normalized,
        isPublished: true,
    }).lean();
    if (!row)
        return null;
    const commentsCount = await NewsInsightComment.countDocuments({ article: row._id });
    return toNewsInsightMobileArticle(row, {
        viewerUserId,
        commentsCount,
    });
};
//# sourceMappingURL=newsInsightService.js.map