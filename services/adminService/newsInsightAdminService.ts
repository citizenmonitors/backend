import mongoose from "mongoose";
import type { Types } from "mongoose";
import AdminLog from "../../models/admin/AdminLog.ts";
import NewsInsight from "../../models/admin/NewsInsight.ts";
import { dispatchMobileNotification } from "../mobile/notificationDispatchService.ts";
import { invalidateAllMobileReadCaches } from "../../utils/cache.ts";

type Id = string | Types.ObjectId;

const requireId = (id: Id | undefined, field: string): Id => {
  if (!id) throw new Error(`${field} is required`);
  return id;
};

const slugifyFromTitle = (title: string): string => {
  const base = title
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return base || "article";
};

const ensureUniqueSlug = async (desired: string): Promise<string> => {
  let candidate = desired;
  let n = 1;
  while (await NewsInsight.exists({ slug: candidate })) {
    n += 1;
    candidate = `${desired}-${n}`;
  }
  return candidate;
};

const toBoolean = (value: unknown, defaultValue: boolean): boolean => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return defaultValue;
};

export type CreateNewsInsightInput = {
  adminId: Id | undefined;
  title: string;
  content: string;
  thumbnailUrl: string;
  heroImageURL?: string;
  excerpt?: string;
  slug?: string;
  publishedAt?: Date | string;
  isPublished?: unknown;
  notifySubscribers?: unknown;
};

export const createNewsInsightArticle = async (input: CreateNewsInsightInput) => {
  const adminId = requireId(input.adminId, "adminId");
  const title = String(input.title ?? "").trim();
  const content = String(input.content ?? "").trim();
  const thumbnailUrl = String(input.thumbnailUrl ?? "").trim();
  if (!title) throw new Error("title is required");
  if (!content) throw new Error("content is required");
  if (!thumbnailUrl) throw new Error("thumbnail image is required");

  const isPublished = toBoolean(input.isPublished, true);
  const notifySubscribers = toBoolean(input.notifySubscribers, isPublished);

  const rawInput = String(input.slug ?? "").trim().toLowerCase();
  let baseSlug = rawInput
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!baseSlug) baseSlug = slugifyFromTitle(title);
  if (!baseSlug) throw new Error("slug could not be generated");
  const slug = await ensureUniqueSlug(baseSlug);

  let publishedAt: Date;
  if (input.publishedAt !== undefined && input.publishedAt !== null && input.publishedAt !== "") {
    const d = new Date(input.publishedAt);
    if (Number.isNaN(d.getTime())) throw new Error("publishedAt must be a valid date");
    publishedAt = d;
  } else {
    publishedAt = new Date();
  }

  const excerpt = input.excerpt !== undefined ? String(input.excerpt).trim() : "";
  const heroImageURL =
    input.heroImageURL !== undefined ? String(input.heroImageURL).trim() : "";

  const article = await NewsInsight.create({
    title,
    slug,
    excerpt,
    content,
    thumbnailUrl,
    heroImageURL: heroImageURL || undefined,
    publishedAt,
    isPublished,
    createdBy: adminId instanceof mongoose.Types.ObjectId ? adminId : new mongoose.Types.ObjectId(adminId),
  });

  await AdminLog.create({
    admin: adminId,
    action: "Created news insight",
    details: {
      articleId: String(article._id),
      slug: article.slug,
      title: article.title,
      isPublished,
      notifySubscribers,
    },
    timestamp: new Date(),
  });

  if (isPublished && notifySubscribers) {
    await dispatchMobileNotification({
      type: "news-insight",
      preferenceKey: "newsAndInsights",
      body: title,
      info: JSON.stringify({ slug: article.slug, articleId: String(article._id) }),
      recipients: ["all"],
    });
  }

  await invalidateAllMobileReadCaches();
  return article.toObject();
};

export const listNewsInsightsForAdmin = async (input?: { page?: number; limit?: number }) => {
  const page = Math.max(1, input?.page ?? 1);
  const limit = Math.min(100, Math.max(1, input?.limit ?? 30));
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    NewsInsight.find({})
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "firstName lastName email role")
      .lean(),
    NewsInsight.countDocuments({}),
  ]);

  return { total, page, limit, items: rows };
};

export const getNewsInsightByIdForAdmin = async (articleId: string) => {
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new Error("Invalid article ID");
  }
  const row = await NewsInsight.findById(articleId)
    .populate("createdBy", "firstName lastName email role")
    .lean();
  if (!row) throw new Error("Article not found");
  return row;
};
