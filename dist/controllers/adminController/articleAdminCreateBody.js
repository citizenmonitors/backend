import { resolveArticleImageUrls } from "../../utils/articleImageUpload.js";
export const buildNewsInsightCreatePayload = async (req) => {
    const r = req;
    const body = req.body;
    const { thumbnailURLUrl, heroImageURL } = await resolveArticleImageUrls({
        body,
        files: r.files,
        firebaseFolder: "news-insights",
    });
    return {
        adminId: r.user?._id,
        title: String(body.title ?? ""),
        content: String(body.content ?? ""),
        thumbnailURLUrl,
        heroImageURL,
        excerpt: body.excerpt !== undefined ? String(body.excerpt) : undefined,
        slug: body.slug !== undefined ? String(body.slug) : undefined,
        publishedAt: body.publishedAt,
        isPublished: body.isPublished,
        notifySubscribers: body.notifySubscribers,
    };
};
export const buildPressCoverageCreatePayload = async (req) => {
    const r = req;
    const body = req.body;
    const { thumbnailURLUrl, heroImageURL } = await resolveArticleImageUrls({
        body,
        files: r.files,
        firebaseFolder: "press-coverage",
    });
    return {
        adminId: r.user?._id,
        title: String(body.title ?? ""),
        content: String(body.content ?? ""),
        thumbnailURL: thumbnailURLUrl,
        heroImageURL,
        excerpt: body.excerpt !== undefined ? String(body.excerpt) : undefined,
        dateline: body.dateline !== undefined ? String(body.dateline) : undefined,
        slug: body.slug !== undefined ? String(body.slug) : undefined,
        publishedAt: body.publishedAt,
        isPublished: body.isPublished,
        notifySubscribers: body.notifySubscribers,
    };
};
//# sourceMappingURL=articleAdminCreateBody.js.map