import type { Types } from "mongoose";
import NewsInsight from "../../models/admin/NewsInsight.ts";
import NewsInsightComment from "../../models/admin/NewsInsightComment.ts";
import { wrapMobileArticleHtml } from "../../utils/mobileArticleHtml.ts";
import { countCommentsForArticles } from "./newsInsightEngagementService.ts";

const likesArray = (row: { likes?: { user?: unknown }[] }): { user?: unknown }[] =>
  Array.isArray(row.likes) ? row.likes : [];

type NewsInsightLean = {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  thumbnailURLUrl: string;
  heroImageURL?: string | null;
  /** @deprecated legacy DB key */
  heroImageURLUrl?: string | null;
  publishedAt: Date;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: { user?: unknown }[];
};

const resolveHeroImageURL = (row: NewsInsightLean): string => {
  const hero =
    row.heroImageURL?.trim() ||
    row.heroImageURLUrl?.trim() ||
    "";
  return hero || row.thumbnailURLUrl;
};

const toNewsInsightMobileArticle = (
  row: NewsInsightLean,
  input: { viewerUserId?: string; commentsCount: number; wrapForMobile?: boolean }
) => {
  const likes = likesArray(row);
  const heroImageURL = resolveHeroImageURL(row);
  const content = input.wrapForMobile
    ? wrapMobileArticleHtml(row.content)
    : row.content;

  return {
    id: String(row._id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt?.trim() || undefined,
    content,
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

export const listPublishedNewsInsightsMobile = async (input?: {
  page?: number;
  limit?: number;
  viewerUserId?: string;
}) => {
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
    items: rows.map((row) =>
      toNewsInsightMobileArticle(row as NewsInsightLean, {
        viewerUserId: viewerId,
        commentsCount: commentCountByArticle.get(String(row._id)) ?? 0,
      })
    ),
  };
};

export const getPublishedNewsInsightBySlugMobile = async (
  slug: string,
  viewerUserId?: string
) => {
  const normalized = slug.trim().toLowerCase();
  const row = await NewsInsight.findOne({
    slug: normalized,
    isPublished: true,
  }).lean();
  if (!row) return null;

  const commentsCount = await NewsInsightComment.countDocuments({ article: row._id });

  return toNewsInsightMobileArticle(row as NewsInsightLean, {
    viewerUserId,
    commentsCount,
    wrapForMobile: true,
  });
};
