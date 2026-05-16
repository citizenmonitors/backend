import mongoose from "mongoose";
import AdminLog from "../../models/admin/AdminLog.js";
import PressCoverage from "../../models/admin/PressCoverage.js";
import { dispatchMobileNotification } from "../mobile/notificationDispatchService.js";
import { invalidateAllMobileReadCaches } from "../../utils/cache.js";
const requireId = (id, field) => {
    if (!id)
        throw new Error(`${field} is required`);
    return id;
};
const slugifyFromTitle = (title) => {
    const base = title
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
    return base || "press-release";
};
const ensureUniqueSlug = async (desired) => {
    let candidate = desired;
    let n = 1;
    while (await PressCoverage.exists({ slug: candidate })) {
        n += 1;
        candidate = `${desired}-${n}`;
    }
    return candidate;
};
const toBoolean = (value, defaultValue) => {
    if (value === undefined || value === null)
        return defaultValue;
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (v === "true")
            return true;
        if (v === "false")
            return false;
    }
    return defaultValue;
};
export const createPressCoverageArticle = async (input) => {
    const adminId = requireId(input.adminId, "adminId");
    const title = String(input.title ?? "").trim();
    const content = String(input.content ?? "").trim();
    const thumbnail = String(input.thumbnail ?? "").trim();
    if (!title)
        throw new Error("title is required");
    if (!content)
        throw new Error("content is required");
    if (!thumbnail)
        throw new Error("thumbnail image is required");
    const isPublished = toBoolean(input.isPublished, true);
    const notifySubscribers = toBoolean(input.notifySubscribers, isPublished);
    const rawInput = String(input.slug ?? "").trim().toLowerCase();
    let baseSlug = rawInput
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    if (!baseSlug)
        baseSlug = slugifyFromTitle(title);
    if (!baseSlug)
        throw new Error("slug could not be generated");
    const slug = await ensureUniqueSlug(baseSlug);
    let publishedAt;
    if (input.publishedAt !== undefined && input.publishedAt !== null && input.publishedAt !== "") {
        const d = new Date(input.publishedAt);
        if (Number.isNaN(d.getTime()))
            throw new Error("publishedAt must be a valid date");
        publishedAt = d;
    }
    else {
        publishedAt = new Date();
    }
    const excerpt = input.excerpt !== undefined ? String(input.excerpt).trim() : "";
    const dateline = input.dateline !== undefined ? String(input.dateline).trim() : "";
    const heroImageURL = input.heroImageURL !== undefined ? String(input.heroImageURL).trim() : "";
    const article = await PressCoverage.create({
        title,
        slug,
        excerpt,
        dateline: dateline || undefined,
        content,
        thumbnail,
        heroImageURL: heroImageURL || undefined,
        publishedAt,
        isPublished,
        createdBy: adminId instanceof mongoose.Types.ObjectId ? adminId : new mongoose.Types.ObjectId(adminId),
    });
    await AdminLog.create({
        admin: adminId,
        action: "Created press coverage",
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
            type: "press-coverage",
            preferenceKey: "pressCoverage",
            body: title,
            info: JSON.stringify({ slug: article.slug, articleId: String(article._id) }),
            recipients: ["all"],
        });
    }
    await invalidateAllMobileReadCaches();
    return article.toObject();
};
export const listPressCoverageForAdmin = async (input) => {
    const page = Math.max(1, input?.page ?? 1);
    const limit = Math.min(100, Math.max(1, input?.limit ?? 30));
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
        PressCoverage.find({})
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "firstName lastName email role")
            .lean(),
        PressCoverage.countDocuments({}),
    ]);
    return { total, page, limit, items: rows };
};
export const getPressCoverageByIdForAdmin = async (articleId) => {
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new Error("Invalid article ID");
    }
    const row = await PressCoverage.findById(articleId)
        .populate("createdBy", "firstName lastName email role")
        .lean();
    if (!row)
        throw new Error("Article not found");
    return row;
};
//# sourceMappingURL=pressCoverageAdminService.js.map