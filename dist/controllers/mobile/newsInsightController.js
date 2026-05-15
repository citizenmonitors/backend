import { addNewsInsightArticleComment, listNewsInsightArticleComments, toggleNewsInsightArticleLike, toggleNewsInsightCommentLike, } from "../../services/mobile/newsInsightEngagementService.js";
import { getPublishedNewsInsightBySlugMobile, listPublishedNewsInsightsMobile, } from "../../services/mobile/newsInsightService.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const parsePageLimit = (req) => {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? "20"), 10) || 20));
    return { page, limit };
};
const optionalViewerId = (req) => {
    const id = req.user?._id;
    return id != null ? String(id) : undefined;
};
const requireUserId = (req) => {
    const id = req.user?._id;
    if (id == null)
        throw new Error("Authentication required");
    return String(id);
};
const toBooleanIfBooleanLike = (value) => {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string") {
        const lowered = value.trim().toLowerCase();
        if (lowered === "true")
            return true;
        if (lowered === "false")
            return false;
    }
    return Boolean(value);
};
export const getNewsInsightsListMobile = async (req, res) => {
    try {
        const { page, limit } = parsePageLimit(req);
        const data = await listPublishedNewsInsightsMobile({
            page,
            limit,
            viewerUserId: optionalViewerId(req),
        });
        return res.status(200).json({
            title: "News & Insight",
            subtitle: "Latest political news from publications.",
            ...data,
        });
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getNewsInsightBySlugMobile = async (req, res) => {
    try {
        const slug = asParamString(req.params.slug).toLowerCase();
        if (!slug || !slugPattern.test(slug)) {
            return res.status(400).json({ message: "Invalid article slug" });
        }
        const article = await getPublishedNewsInsightBySlugMobile(slug, optionalViewerId(req));
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        return res.status(200).json(article);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const postNewsInsightArticleLikeMobile = async (req, res) => {
    try {
        const r = req;
        const articleId = asParamString(req.params.articleId);
        if (!isValidObjectId(articleId)) {
            return res.status(400).json({ message: "Invalid article id" });
        }
        const userId = requireUserId(r);
        const data = await toggleNewsInsightArticleLike(userId, articleId);
        return res.status(200).json(data);
    }
    catch (error) {
        const message = getErrorMessage(error);
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("not found"))
            return res.status(404).json({ message });
        if (message.includes("Invalid"))
            return res.status(400).json({ message });
        return res.status(400).json({ message });
    }
};
export const getNewsInsightArticleCommentsMobile = async (req, res) => {
    try {
        const r = req;
        const articleId = asParamString(req.params.articleId);
        if (!isValidObjectId(articleId)) {
            return res.status(400).json({ message: "Invalid article id" });
        }
        const userId = requireUserId(r);
        const comments = await listNewsInsightArticleComments(userId, articleId);
        return res.status(200).json({ comments });
    }
    catch (error) {
        const message = getErrorMessage(error);
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("not found"))
            return res.status(404).json({ message });
        if (message.includes("Invalid"))
            return res.status(400).json({ message });
        return res.status(400).json({ message });
    }
};
export const postNewsInsightArticleCommentMobile = async (req, res) => {
    try {
        const r = req;
        const articleId = asParamString(req.params.articleId);
        if (!isValidObjectId(articleId)) {
            return res.status(400).json({ message: "Invalid article id" });
        }
        const userId = requireUserId(r);
        const body = String(req.body?.body ?? "").trim();
        if (!body)
            return res.status(400).json({ message: "body is required" });
        const useAnonymousDisplay = toBooleanIfBooleanLike(req.body?.useAnonymousDisplay);
        const comment = await addNewsInsightArticleComment(userId, articleId, {
            body,
            useAnonymousDisplay,
        });
        return res.status(201).json({ comment });
    }
    catch (error) {
        const message = getErrorMessage(error);
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("anonymous username")) {
            return res.status(400).json({ message });
        }
        if (message.includes("not found"))
            return res.status(404).json({ message });
        return res.status(500).json({ message });
    }
};
export const postNewsInsightCommentLikeMobile = async (req, res) => {
    try {
        const r = req;
        const articleId = asParamString(req.params.articleId);
        const commentId = asParamString(req.params.commentId);
        if (!isValidObjectId(articleId) || !isValidObjectId(commentId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userId = requireUserId(r);
        const comment = await toggleNewsInsightCommentLike(userId, articleId, commentId);
        return res.status(200).json({ comment });
    }
    catch (error) {
        const message = getErrorMessage(error);
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("not found"))
            return res.status(404).json({ message });
        return res.status(400).json({ message });
    }
};
//# sourceMappingURL=newsInsightController.js.map