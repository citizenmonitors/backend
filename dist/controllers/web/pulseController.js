import { asParamString, isValidObjectId } from "../../utils/validators.js";
import { invalidateCacheByPrefixes } from "../../utils/cache.js";
import { addPulsePostCommentAnyLocation, createPulsePost, listPulsePostCommentsPublic, listPulsePostsPublic, parsePulseFeedScope, parseVisibilityScope, repostPulsePost, togglePulseCommentLikeAnyLocation, togglePulsePostLikeAnyLocation, } from "../../services/mobile/pulseService.js";
const errMsg = (e) => (e instanceof Error ? e.message : String(e));
const requireUserId = (req) => {
    const id = req.user?._id;
    if (id == null)
        throw new Error("Authentication required");
    return String(id);
};
const invalidateMobileReadCaches = async (userId) => {
    await invalidateCacheByPrefixes([
        `mobile:elections:${userId}:`,
        `mobile:dashboard:${userId}:`,
    ]);
};
const toBooleanIfBooleanLike = (value) => {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string") {
        const lowered = value.trim().toLowerCase();
        return lowered === "true" || lowered === "1" || lowered === "yes";
    }
    return false;
};
/** Public GET. scope=all needs no auth; state/lga/ward/polling-unit uses the signed-in user's location. */
export const getPulsePostsPublic = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
        const scope = parsePulseFeedScope(req.query.scope);
        const viewerUserId = req.user?._id;
        if (scope !== "all" && viewerUserId == null) {
            return res.status(401).json({
                message: "Sign in to filter Pulse by your location",
            });
        }
        const data = await listPulsePostsPublic(page, limit, scope, viewerUserId);
        return res.status(200).json(data);
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("haven't blocked")) {
            return res.status(403).json({ message });
        }
        if (message.includes("Sign in") ||
            message.includes("Authentication") ||
            message.includes("User not found")) {
            return res.status(401).json({ message });
        }
        if (message.includes("Invalid Pulse") ||
            message.includes("profile") ||
            message.includes("Complete your")) {
            return res.status(400).json({ message });
        }
        return res.status(500).json({ message });
    }
};
/** Public web pulse comments — no auth, no location filter. */
export const getPulsePostCommentsPublic = async (req, res) => {
    try {
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(postId)) {
            return res.status(400).json({ message: "Invalid post id" });
        }
        const viewerUserId = req.user?._id;
        const comments = await listPulsePostCommentsPublic(postId, viewerUserId);
        return res.status(200).json({ comments });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("haven't blocked")) {
            return res.status(403).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(500).json({ message });
    }
};
/** Auth required — create a pulse post (uses author profile location for audience). */
export const postPulsePostWeb = async (req, res) => {
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
            visibilityScope: parseVisibilityScope(b.visibilityScope, "all"),
            useAnonymousDisplay: toBooleanIfBooleanLike(b.useAnonymousDisplay),
        }, { image });
        await invalidateMobileReadCaches(userId);
        return res.status(201).json({ post });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("haven't blocked")) {
            return res.status(403).json({ message });
        }
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("anonymous username") ||
            message.includes("Invalid Pulse") ||
            message.includes("profile") ||
            message.includes("Complete your") ||
            message.includes("body must") ||
            message.includes("location")) {
            return res.status(400).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const postPulseRepostWeb = async (req, res) => {
    try {
        const r = req;
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(postId)) {
            return res.status(400).json({ message: "Invalid post id" });
        }
        const userId = requireUserId(r);
        const post = await repostPulsePost(userId, postId);
        await invalidateMobileReadCaches(userId);
        return res.status(201).json({ post });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("haven't blocked")) {
            return res.status(403).json({ message });
        }
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("already reposted") || message.includes("your own post")) {
            return res.status(409).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(400).json({ message });
    }
};
export const postPulsePostLikeWeb = async (req, res) => {
    try {
        const r = req;
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(postId)) {
            return res.status(400).json({ message: "Invalid post id" });
        }
        const userId = requireUserId(r);
        const data = await togglePulsePostLikeAnyLocation(userId, postId);
        await invalidateMobileReadCaches(userId);
        return res.status(200).json(data);
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("haven't blocked")) {
            return res.status(403).json({ message });
        }
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(400).json({ message });
    }
};
export const postPulsePostCommentWeb = async (req, res) => {
    try {
        const r = req;
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(postId)) {
            return res.status(400).json({ message: "Invalid post id" });
        }
        const userId = requireUserId(r);
        const body = String(req.body?.body ?? "").trim();
        if (!body)
            return res.status(400).json({ message: "body is required" });
        const useAnonymousDisplay = toBooleanIfBooleanLike(req.body?.useAnonymousDisplay);
        const comment = await addPulsePostCommentAnyLocation(userId, postId, {
            body,
            useAnonymousDisplay,
        });
        await invalidateMobileReadCaches(userId);
        return res.status(201).json({ comment });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("haven't blocked")) {
            return res.status(403).json({ message });
        }
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("anonymous username") || message.includes("body must")) {
            return res.status(400).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const postPulseCommentLikeWeb = async (req, res) => {
    try {
        const r = req;
        const postId = asParamString(req.params.postId);
        const commentId = asParamString(req.params.commentId);
        if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userId = requireUserId(r);
        const comment = await togglePulseCommentLikeAnyLocation(userId, postId, commentId);
        await invalidateMobileReadCaches(userId);
        return res.status(200).json({ comment });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("haven't blocked")) {
            return res.status(403).json({ message });
        }
        if (message.includes("Authentication required")) {
            return res.status(401).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(400).json({ message });
    }
};
//# sourceMappingURL=pulseController.js.map