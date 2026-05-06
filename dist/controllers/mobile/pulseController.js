import { asParamString, isValidObjectId } from "../../utils/validators.js";
import { addPulsePostComment, createPulsePost, listPulsePostComments, listPulsePosts, togglePulseCommentLike, togglePulsePostLike, } from "../../services/mobile/pulseService.js";
import { invalidateCacheByPrefixes } from "../../utils/cache.js";
const errMsg = (e) => (e instanceof Error ? e.message : String(e));
const requireUserId = (req) => {
    const id = req.user?._id;
    if (id == null)
        throw new Error("Authentication required");
    return String(id);
};
const invalidateMobileReadCaches = async (userId) => {
    await invalidateCacheByPrefixes([`mobile:elections:${userId}:`, `mobile:dashboard:${userId}:`]);
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
export const getPulsePostsMobile = async (req, res) => {
    try {
        const r = req;
        const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
        const userId = requireUserId(r);
        const data = await listPulsePosts(userId, page, limit);
        return res.status(200).json(data);
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("profile") || message.includes("location")) {
            return res.status(400).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const postPulsePostMobile = async (req, res) => {
    try {
        const r = req;
        const userId = requireUserId(r);
        const b = req.body;
        const body = String(b.body ?? "").trim();
        if (!body)
            return res.status(400).json({ message: "body is required" });
        const image = r.files?.image?.[0];
        const post = await createPulsePost(userId, {
            body,
            visibilityScope: b.visibilityScope === "ward" ? "ward" : "lga",
            useAnonymousDisplay: toBooleanIfBooleanLike(b.useAnonymousDisplay),
        }, { image });
        await invalidateMobileReadCaches(userId);
        return res.status(201).json({ post });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("anonymous username") ||
            message.includes("profile") ||
            message.includes("location")) {
            return res.status(400).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const postPulsePostLikeMobile = async (req, res) => {
    try {
        const r = req;
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(postId))
            return res.status(400).json({ message: "Invalid post id" });
        const userId = requireUserId(r);
        const data = await togglePulsePostLike(userId, postId);
        await invalidateMobileReadCaches(userId);
        return res.status(200).json(data);
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("not available for your location")) {
            return res.status(403).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(400).json({ message });
    }
};
export const getPulsePostCommentsMobile = async (req, res) => {
    try {
        const r = req;
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(postId))
            return res.status(400).json({ message: "Invalid post id" });
        const userId = requireUserId(r);
        const comments = await listPulsePostComments(userId, postId);
        return res.status(200).json({ comments });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("not available for your location")) {
            return res.status(403).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(400).json({ message });
    }
};
export const postPulsePostCommentMobile = async (req, res) => {
    try {
        const r = req;
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(postId))
            return res.status(400).json({ message: "Invalid post id" });
        const userId = requireUserId(r);
        const body = String(req.body?.body ?? "").trim();
        if (!body)
            return res.status(400).json({ message: "body is required" });
        const useAnonymousDisplay = toBooleanIfBooleanLike(req.body?.useAnonymousDisplay);
        const comment = await addPulsePostComment(userId, postId, {
            body,
            useAnonymousDisplay,
        });
        await invalidateMobileReadCaches(userId);
        return res.status(201).json({ comment });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("anonymous username") ||
            message.includes("not available for your location")) {
            return res.status(400).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const postPulseCommentLikeMobile = async (req, res) => {
    try {
        const r = req;
        const postId = asParamString(req.params.postId);
        const commentId = asParamString(req.params.commentId);
        if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userId = requireUserId(r);
        const comment = await togglePulseCommentLike(userId, postId, commentId);
        await invalidateMobileReadCaches(userId);
        return res.status(200).json({ comment });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("not available for your location")) {
            return res.status(403).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(400).json({ message });
    }
};
//# sourceMappingURL=pulseController.js.map