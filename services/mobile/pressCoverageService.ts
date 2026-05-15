import mongoose from "mongoose";
import type { Types } from "mongoose";
import PressCoverage from "../../models/admin/PressCoverage.ts";
import PressCoverageComment from "../../models/admin/PressCoverageComment.ts";

const textPreview = (html: string, max: number): string => {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max)}…`;
};

const likesArray = (row: { likes?: { user?: unknown }[] }): { user?: unknown }[] =>
  Array.isArray(row.likes) ? row.likes : [];

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
    PressCoverage.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("slug title thumbnail publishedAt excerpt content likes dateline")
      .lean(),
    PressCoverage.countDocuments(filter),
  ]);

  const ids = rows.map((row) => String(row._id));
  const commentCountByArticle = await countCommentsForPressCoverageArticles(ids);

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
        thumbnail: row.thumbnail,
        summary: row.excerpt?.trim() || textPreview(String(row.content ?? ""), 220),
        publishedAt: row.publishedAt,
        dateline: row.dateline?.trim() || undefined,
        likesCount: likes.length,
        commentsCount: commentCountByArticle.get(String(row._id)) ?? 0,
        isLikedByCurrentUser: viewerId
          ? likes.some((l) => l.user != null && String(l.user) === viewerId)
          : false,
      };
    }),
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
  })
    .select(
      "slug title excerpt dateline content thumbnail heroImage publishedAt createdAt likes"
    )
    .lean();
  if (!row) return null;

  const hero = row.heroImage?.trim() || row.thumbnail;
  const likes = likesArray(row);
  const commentsCount = await PressCoverageComment.countDocuments({ article: row._id });

  return {
    id: String(row._id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt?.trim() || textPreview(String(row.content ?? ""), 280),
    dateline: row.dateline?.trim() || undefined,
    content: row.content,
    thumbnail: row.thumbnail,
    heroImage: hero,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    likesCount: likes.length,
    commentsCount,
    isLikedByCurrentUser: viewerUserId
      ? likes.some((l) => l.user != null && String(l.user) === viewerUserId)
      : false,
  };
};
