import { asParamString, isValidObjectId } from "../../utils/validators.js";
import { invalidateCacheByPrefixes } from "../../utils/cache.js";
import { deletePulseComment, deletePulsePost, undoPulseRepost, unlikePulseComment, unlikePulsePost, updatePulseComment, updatePulsePost, PULSE_IMAGE_UPLOAD_FAILED_MESSAGE, } from "../../services/mobile/pulseService.js";
const errMsg = (e) => (e instanceof Error ? e.message : String(e));
const requireUserId = (req) => {
    const id = req.user?._id;
    if (id == null)
        throw new Error("Authentication required");
    return String(id);
};
const invalidateReadCaches = async (userId) => {
    await invalidateCacheByPrefixes([
        `mobile:elections:${userId}:`,
        `mobile:dashboard:${userId}:`,
    ]);
};
/** Returns undefined when the field was not sent, so PATCH only touches what's given. */
const optionalBoolean = (value) => {
    if (value === undefined || value === null || value === "")
        return undefined;
    if (typeof value === "boolean")
        return value;
    const lowered = String(value).trim().toLowerCase();
    return lowered === "true" || lowered === "1" || lowered === "yes";
};
const statusFor = (message) => {
    if (message.includes("Authentication required"))
        return 401;
    if (message.includes("could not be uploaded"))
        return 503;
    if (message.includes("You can only"))
        return 403;
    if (message.includes("not found") || message.includes("have not reposted"))
        return 404;
    if (message.includes("body must") ||
        message.includes("Nothing to update") ||
        message.includes("cannot be edited") ||
        message.includes("anonymous username") ||
        message.includes("Invalid Pulse") ||
        message.includes("Complete your")) {
        return 400;
    }
    return 500;
};
const sendError = (res, error) => {
    const message = errMsg(error);
    return res.status(statusFor(message)).json({ message });
};
const readIds = (req, withComment) => {
    const postId = asParamString(req.params.postId);
    const commentId = withComment ? asParamString(req.params.commentId) : "";
    const valid = isValidObjectId(postId) && (!withComment || isValidObjectId(commentId));
    return { postId, commentId, valid };
};
/** PATCH /posts/:postId — multipart or JSON: body, visibilityScope, useAnonymousDisplay, removeImage, image file. */
export const patchPulsePost = async (req, res) => {
    try {
        const { postId, valid } = readIds(req, false);
        if (!valid)
            return res.status(400).json({ message: "Invalid post id" });
        const userId = requireUserId(req);
        const b = (req.body ?? {});
        const image = req.files?.image;
        const post = await updatePulsePost(userId, postId, {
            body: b.body,
            visibilityScope: b.visibilityScope,
            useAnonymousDisplay: optionalBoolean(b.useAnonymousDisplay),
            removeImage: optionalBoolean(b.removeImage),
        }, { image: image?.[0] });
        await invalidateReadCaches(userId);
        return res.status(200).json({
            post,
            ...(post.imageUploadFailed ? { warning: PULSE_IMAGE_UPLOAD_FAILED_MESSAGE } : {}),
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
/** DELETE /posts/:postId */
export const removePulsePost = async (req, res) => {
    try {
        const { postId, valid } = readIds(req, false);
        if (!valid)
            return res.status(400).json({ message: "Invalid post id" });
        const userId = requireUserId(req);
        const data = await deletePulsePost(userId, postId);
        await invalidateReadCaches(userId);
        return res.status(200).json(data);
    }
    catch (error) {
        return sendError(res, error);
    }
};
/** DELETE /posts/:postId/repost — postId may be the original or your repost of it. */
export const removePulseRepost = async (req, res) => {
    try {
        const { postId, valid } = readIds(req, false);
        if (!valid)
            return res.status(400).json({ message: "Invalid post id" });
        const userId = requireUserId(req);
        const data = await undoPulseRepost(userId, postId);
        await invalidateReadCaches(userId);
        return res.status(200).json(data);
    }
    catch (error) {
        return sendError(res, error);
    }
};
/** DELETE /posts/:postId/like */
export const removePulsePostLike = async (req, res) => {
    try {
        const { postId, valid } = readIds(req, false);
        if (!valid)
            return res.status(400).json({ message: "Invalid post id" });
        const userId = requireUserId(req);
        const data = await unlikePulsePost(userId, postId);
        await invalidateReadCaches(userId);
        return res.status(200).json(data);
    }
    catch (error) {
        return sendError(res, error);
    }
};
/** PATCH /posts/:postId/comments/:commentId — body, useAnonymousDisplay */
export const patchPulseComment = async (req, res) => {
    try {
        const { postId, commentId, valid } = readIds(req, true);
        if (!valid)
            return res.status(400).json({ message: "Invalid id" });
        const userId = requireUserId(req);
        const b = (req.body ?? {});
        const comment = await updatePulseComment(userId, postId, commentId, {
            body: b.body,
            useAnonymousDisplay: optionalBoolean(b.useAnonymousDisplay),
        });
        await invalidateReadCaches(userId);
        return res.status(200).json({ comment });
    }
    catch (error) {
        return sendError(res, error);
    }
};
/** DELETE /posts/:postId/comments/:commentId — comment author or post author. */
export const removePulseComment = async (req, res) => {
    try {
        const { postId, commentId, valid } = readIds(req, true);
        if (!valid)
            return res.status(400).json({ message: "Invalid id" });
        const userId = requireUserId(req);
        const data = await deletePulseComment(userId, postId, commentId);
        await invalidateReadCaches(userId);
        return res.status(200).json(data);
    }
    catch (error) {
        return sendError(res, error);
    }
};
/** DELETE /posts/:postId/comments/:commentId/like */
export const removePulseCommentLike = async (req, res) => {
    try {
        const { postId, commentId, valid } = readIds(req, true);
        if (!valid)
            return res.status(400).json({ message: "Invalid id" });
        const userId = requireUserId(req);
        const comment = await unlikePulseComment(userId, postId, commentId);
        await invalidateReadCaches(userId);
        return res.status(200).json({ comment });
    }
    catch (error) {
        return sendError(res, error);
    }
};
//# sourceMappingURL=pulseManageController.js.map