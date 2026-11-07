import type { Types } from "mongoose";
import mongoose from "mongoose";
import CompletedUser from "../../models/CompletedUser.ts";
import NewsInsight from "../../models/admin/NewsInsight.ts";
import NewsInsightComment from "../../models/admin/NewsInsightComment.ts";

type Id = Types.ObjectId | string;

type AuthorLean = {
  _id?: Id;
  firstName?: string | null;
  lastName?: string | null;
  anonymousUsername?: string | null;
  profileImage?: { url?: string | null } | null;
};

const AUTHOR_FIELDS = "firstName lastName anonymousUsername profileImage.url";

const formatAuthorDisplay = (
  author: AuthorLean | null | undefined,
  useAnonymousDisplay: boolean
): { displayName: string; usedAnonymous: boolean } => {
  if (!author) return { displayName: "Member", usedAnonymous: false };
  if (useAnonymousDisplay && author.anonymousUsername) {
    return { displayName: `@${author.anonymousUsername}`, usedAnonymous: true };
  }
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
  return { displayName: name || "Member", usedAnonymous: false };
};

const ensureViewer = async (userId: Id) => {
  const user = await CompletedUser.findById(userId).lean();
  if (!user) throw new Error("User not found");
  return user;
};

const assertPublishedArticle = async (articleId: string) => {
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new Error("Invalid article id");
  }
  const article = await NewsInsight.findOne({
    _id: articleId,
    isPublished: true,
  }).lean();
  if (!article) throw new Error("Article not found");
  return article;
};

const serializeComment = (
  row: {
    _id: Id;
    body?: string;
    useAnonymousDisplay?: boolean;
    likes?: { user?: Id }[];
    author?: AuthorLean | null;
    createdAt?: Date;
    updatedAt?: Date;
    editedAt?: Date | null;
  },
  viewerUserId: Id
) => {
  const likes = Array.isArray(row.likes) ? row.likes : [];
  const { displayName, usedAnonymous } = formatAuthorDisplay(
    row.author,
    Boolean(row.useAnonymousDisplay)
  );
  const photo = String(row.author?.profileImage?.url ?? "").trim();
  return {
    id: String(row._id),
    body: row.body,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    // Only set when the text is edited; use it for an "Edited" label.
    editedAt: row.editedAt ?? null,
    author: {
      // Hide the account id and photo behind an anonymous name.
      id: !usedAnonymous && row.author?._id != null ? String(row.author._id) : null,
      displayName,
      usedAnonymous,
      avatarUrl: !usedAnonymous && /^https?:\/\//i.test(photo) ? photo : null,
    },
    isOwnedByCurrentUser:
      row.author?._id != null && String(row.author._id) === String(viewerUserId),
    likesCount: likes.length,
    isLikedByCurrentUser: likes.some(
      (l) => l.user != null && String(l.user) === String(viewerUserId)
    ),
  };
};

export const toggleNewsInsightArticleLike = async (userId: Id, articleId: string) => {
  await assertPublishedArticle(articleId);
  await ensureViewer(userId);

  const article = await NewsInsight.findById(articleId);
  if (!article) throw new Error("Article not found");

  const likes = article.likes ?? [];
  const idx = likes.findIndex((l) => String(l.user) === String(userId));
  if (idx >= 0) likes.splice(idx, 1);
  else likes.push({ user: userId as never });
  article.likes = likes as never;
  await article.save();

  return {
    id: String(article._id),
    likesCount: likes.length,
    isLikedByCurrentUser: idx < 0,
  };
};

export const listNewsInsightArticleComments = async (userId: Id, articleId: string) => {
  await assertPublishedArticle(articleId);
  await ensureViewer(userId);

  const rows = await NewsInsightComment.find({ article: articleId })
    .populate("author", AUTHOR_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
  return rows.map((row) => serializeComment(row, userId));
};

export const addNewsInsightArticleComment = async (
  userId: Id,
  articleId: string,
  input: { body: string; useAnonymousDisplay?: boolean }
) => {
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
    .populate("author", AUTHOR_FIELDS)
    .lean();

  return serializeComment(populated!, userId);
};

export const toggleNewsInsightCommentLike = async (
  userId: Id,
  articleId: string,
  commentId: string
) => {
  await assertPublishedArticle(articleId);
  await ensureViewer(userId);

  const comment = await NewsInsightComment.findOne({ _id: commentId, article: articleId });
  if (!comment) throw new Error("Comment not found");

  const likes = comment.likes ?? [];
  const idx = likes.findIndex((l) => String(l.user) === String(userId));
  if (idx >= 0) likes.splice(idx, 1);
  else likes.push({ user: userId as never });
  comment.likes = likes as never;
  await comment.save();

  const populated = await NewsInsightComment.findById(comment._id)
    .populate("author", AUTHOR_FIELDS)
    .lean();
  return serializeComment(populated!, userId);
};

export const countCommentsForArticles = async (
  articleIds: string[]
): Promise<Map<string, number>> => {
  if (articleIds.length === 0) return new Map();
  const oids = articleIds.map((id) => new mongoose.Types.ObjectId(id));
  const rows = await NewsInsightComment.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { article: { $in: oids } } },
    { $group: { _id: "$article", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
};

/** Comment author only. Send `body` and/or `useAnonymousDisplay`. */
export const updateNewsInsightComment = async (
  userId: Id,
  articleId: string,
  commentId: string,
  input: { body?: unknown; useAnonymousDisplay?: boolean }
) => {
  await assertPublishedArticle(articleId);
  const comment = await NewsInsightComment.findOne({ _id: commentId, article: articleId }).lean();
  if (!comment) throw new Error("Comment not found");
  if (String(comment.author) !== String(userId)) {
    throw new Error("You can only edit your own comment");
  }

  const set: Record<string, unknown> = {};
  if (input.body !== undefined) {
    const body = String(input.body ?? "").trim();
    if (!body) throw new Error("body must not be empty");
    if (body.length > 3000) throw new Error("body must be 3000 characters or fewer");
    set.body = body;
    set.editedAt = new Date();
  }
  if (input.useAnonymousDisplay !== undefined) {
    if (input.useAnonymousDisplay) {
      const author = await ensureViewer(userId);
      if (!author.anonymousUsername) {
        throw new Error("Set an anonymous username before commenting anonymously");
      }
    }
    set.useAnonymousDisplay = input.useAnonymousDisplay;
  }
  if (Object.keys(set).length === 0) throw new Error("Nothing to update");

  const updated = await NewsInsightComment.findOneAndUpdate(
    { _id: commentId, article: articleId },
    { $set: set },
    { new: true }
  )
    .populate("author", AUTHOR_FIELDS)
    .lean();
  if (!updated) throw new Error("Comment not found");
  return serializeComment(updated, userId);
};

/** The comment's author, or an admin (moderation), can delete it. */
export const deleteNewsInsightComment = async (
  userId: Id,
  articleId: string,
  commentId: string
) => {
  const comment = await NewsInsightComment.findOne({ _id: commentId, article: articleId }).lean();
  if (!comment) throw new Error("Comment not found");
  if (String(comment.author) !== String(userId)) {
    const actor = await CompletedUser.findById(userId).select("role").lean();
    if (actor?.role !== "admin" && actor?.role !== "super-admin") {
      throw new Error("You can only delete your own comment");
    }
  }
  await NewsInsightComment.deleteOne({ _id: commentId });
  return { id: String(commentId), deleted: true };
};
