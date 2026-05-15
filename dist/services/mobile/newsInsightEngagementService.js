import mongoose from "mongoose";
import CompletedUser from "../../models/CompletedUser.js";
import NewsInsight from "../../models/admin/NewsInsight.js";
import NewsInsightComment from "../../models/admin/NewsInsightComment.js";
const formatAuthorDisplay = (author, useAnonymousDisplay) => {
    if (!author)
        return { displayName: "Member", usedAnonymous: false };
    if (useAnonymousDisplay && author.anonymousUsername) {
        return { displayName: `@${author.anonymousUsername}`, usedAnonymous: true };
    }
    const name = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
    return { displayName: name || "Member", usedAnonymous: false };
};
const ensureViewer = async (userId) => {
    const user = await CompletedUser.findById(userId).lean();
    if (!user)
        throw new Error("User not found");
    return user;
};
const assertPublishedArticle = async (articleId) => {
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new Error("Invalid article id");
    }
    const article = await NewsInsight.findOne({
        _id: articleId,
        isPublished: true,
    }).lean();
    if (!article)
        throw new Error("Article not found");
    return article;
};
const serializeComment = (row, viewerUserId) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    const { displayName, usedAnonymous } = formatAuthorDisplay(row.author, Boolean(row.useAnonymousDisplay));
    return {
        id: String(row._id),
        body: row.body,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: {
            id: row.author?._id != null ? String(row.author._id) : undefined,
            displayName,
            usedAnonymous,
        },
        likesCount: likes.length,
        isLikedByCurrentUser: likes.some((l) => l.user != null && String(l.user) === String(viewerUserId)),
    };
};
export const toggleNewsInsightArticleLike = async (userId, articleId) => {
    await assertPublishedArticle(articleId);
    await ensureViewer(userId);
    const article = await NewsInsight.findById(articleId);
    if (!article)
        throw new Error("Article not found");
    const likes = article.likes ?? [];
    const idx = likes.findIndex((l) => String(l.user) === String(userId));
    if (idx >= 0)
        likes.splice(idx, 1);
    else
        likes.push({ user: userId });
    article.likes = likes;
    await article.save();
    return {
        id: String(article._id),
        likesCount: likes.length,
        isLikedByCurrentUser: idx < 0,
    };
};
export const listNewsInsightArticleComments = async (userId, articleId) => {
    await assertPublishedArticle(articleId);
    await ensureViewer(userId);
    const rows = await NewsInsightComment.find({ article: articleId })
        .populate("author", "firstName lastName anonymousUsername")
        .sort({ createdAt: -1 })
        .lean();
    return rows.map((row) => serializeComment(row, userId));
};
export const addNewsInsightArticleComment = async (userId, articleId, input) => {
    await assertPublishedArticle(articleId);
    const author = await ensureViewer(userId);
    const useAnonymous = Boolean(input.useAnonymousDisplay);
    if (useAnonymous && !author.anonymousUsername) {
        throw new Error("Set an anonymous username before commenting anonymously");
    }
    const created = await NewsInsightComment.create({
        article: articleId,
        author: userId,
        body: input.body.trim(),
        useAnonymousDisplay: useAnonymous,
        likes: [],
    });
    const populated = await NewsInsightComment.findById(created._id)
        .populate("author", "firstName lastName anonymousUsername")
        .lean();
    return serializeComment(populated, userId);
};
export const toggleNewsInsightCommentLike = async (userId, articleId, commentId) => {
    await assertPublishedArticle(articleId);
    await ensureViewer(userId);
    const comment = await NewsInsightComment.findOne({ _id: commentId, article: articleId });
    if (!comment)
        throw new Error("Comment not found");
    const likes = comment.likes ?? [];
    const idx = likes.findIndex((l) => String(l.user) === String(userId));
    if (idx >= 0)
        likes.splice(idx, 1);
    else
        likes.push({ user: userId });
    comment.likes = likes;
    await comment.save();
    const populated = await NewsInsightComment.findById(comment._id)
        .populate("author", "firstName lastName anonymousUsername")
        .lean();
    return serializeComment(populated, userId);
};
export const countCommentsForArticles = async (articleIds) => {
    if (articleIds.length === 0)
        return new Map();
    const oids = articleIds.map((id) => new mongoose.Types.ObjectId(id));
    const rows = await NewsInsightComment.aggregate([
        { $match: { article: { $in: oids } } },
        { $group: { _id: "$article", count: { $sum: 1 } } },
    ]);
    return new Map(rows.map((r) => [String(r._id), r.count]));
};
//# sourceMappingURL=newsInsightEngagementService.js.map