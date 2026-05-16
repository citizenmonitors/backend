import mongoose from "mongoose";
import type { Types } from "mongoose";
import PressCoverage from "../../models/admin/PressCoverage.ts";
import PressCoverageComment from "../../models/admin/PressCoverageComment.ts";

const likesArray = (row: { likes?: { user?: unknown }[] }): { user?: unknown }[] =>
  Array.isArray(row.likes) ? row.likes : [];

type PressCoverageLean = {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  excerpt?: string | null;
  dateline?: string | null;
  content: string;
  thumbnailURL: string;
  heroImageURL?: string | null;
  publishedAt: Date;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: { user?: unknown }[];
};

const toPressCoverageMobileArticle = (
  row: PressCoverageLean,
  input: { viewerUserId?: string; commentsCount: number }
) => {
  const likes = likesArray(row);
  const heroImageURL = row.heroImageURL?.trim() || row.thumbnailURL;

  return {
    id: String(row._id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt?.trim() || undefined,
    dateline: row.dateline?.trim() || undefined,
    content: row.content,
    thumbnailURL: row.thumbnailURL,
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

export const countCommentsForPressCoverageArticles = async (
  articleIds: string[]
): Promise<Map<string, number>> => {
  if (articleIds.length === 0) return new Map();
  const oids = articleIds.map((id) => new mongoose.Types.ObjectId(id));
  const rows = await PressCoverageComment.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { article: { $in: oids } } },
    { $group: { _id: "$article", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
};

export const listPublishedPressCoverageMobile = async (input?: {
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
    PressCoverage.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
    PressCoverage.countDocuments(filter),
  ]);

  const ids = rows.map((row) => String(row._id));
  const commentCountByArticle = await countCommentsForPressCoverageArticles(ids);

  return {
    total,
    page,
    limit,
    items: rows.map((row) =>
      toPressCoverageMobileArticle(row as PressCoverageLean, {
        viewerUserId: viewerId,
        commentsCount: commentCountByArticle.get(String(row._id)) ?? 0,
      })
    ),
  };
};

export const getPublishedPressCoverageBySlugMobile = async (
  slug: string,
  viewerUserId?: string
) => {
  const normalized = slug.trim().toLowerCase();
  const row = await PressCoverage.findOne({
    slug: normalized,
    isPublished: true,
  }).lean();
  if (!row) return null;

  const commentsCount = await PressCoverageComment.countDocuments({ article: row._id });

  return toPressCoverageMobileArticle(row as PressCoverageLean, {
    viewerUserId,
    commentsCount,
  });
};
