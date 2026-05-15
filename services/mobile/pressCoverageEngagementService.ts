import type { Types } from "mongoose";
import mongoose from "mongoose";
import CompletedUser from "../../models/CompletedUser.ts";
import PressCoverage from "../../models/admin/PressCoverage.ts";
import PressCoverageComment from "../../models/admin/PressCoverageComment.ts";

type Id = Types.ObjectId | string;

type AuthorLean = {
  _id?: Id;
  firstName?: string | null;
  lastName?: string | null;
  anonymousUsername?: string | null;
};

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
  const article = await PressCoverage.findOne({
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
  },
  viewerUserId: Id
) => {
  const likes = Array.isArray(row.likes) ? row.likes : [];
  const { displayName, usedAnonymous } = formatAuthorDisplay(
    row.author,
    Boolean(row.useAnonymousDisplay)
  );
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
    isLikedByCurrentUser: likes.some(
      (l) => l.user != null && String(l.user) === String(viewerUserId)
    ),
  };
};

export const togglePressCoverageArticleLike = async (userId: Id, articleId: string) => {
  await assertPublishedArticle(articleId);
  await ensureViewer(userId);

  const article = await PressCoverage.findById(articleId);
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

export const listPressCoverageArticleComments = async (userId: Id, articleId: string) => {
  await assertPublishedArticle(articleId);
  await ensureViewer(userId);

  const rows = await PressCoverageComment.find({ article: articleId })
    .populate("author", "firstName lastName anonymousUsername")
    .sort({ createdAt: -1 })
    .lean();
  return rows.map((row) => serializeComment(row, userId));
};

export const addPressCoverageArticleComment = async (
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

  const created = await PressCoverageComment.create({
    article: articleId,
    author: userId,
    body: input.body.trim(),
    useAnonymousDisplay: useAnonymous,
    likes: [],
  });

  const populated = await PressCoverageComment.findById(created._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();

  return serializeComment(populated!, userId);
};

export const togglePressCoverageCommentLike = async (
  userId: Id,
  articleId: string,
  commentId: string
) => {
  await assertPublishedArticle(articleId);
  await ensureViewer(userId);

  const comment = await PressCoverageComment.findOne({ _id: commentId, article: articleId });
  if (!comment) throw new Error("Comment not found");

  const likes = comment.likes ?? [];
  const idx = likes.findIndex((l) => String(l.user) === String(userId));
  if (idx >= 0) likes.splice(idx, 1);
  else likes.push({ user: userId as never });
  comment.likes = likes as never;
  await comment.save();

  const populated = await PressCoverageComment.findById(comment._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();
  return serializeComment(populated!, userId);
};

export { countCommentsForPressCoverageArticles } from "./pressCoverageService.ts";
