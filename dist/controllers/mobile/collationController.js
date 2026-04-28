import { asParamString, isValidObjectId } from "../../utils/validators.js";
import { getMobileCollationBundle, mobileCollationUserAction, } from "../../services/mobile/collationBundleService.js";
import { addPostComment, addReportThreadComment, createDiscussionPost, listDiscussionPosts, listPostComments, listReportThreadComments, toggleDiscussionPostLike, togglePostCommentLike, toggleReportCommentLike, } from "../../services/mobile/collationDiscussionService.js";
const errMsg = (e) => (e instanceof Error ? e.message : String(e));
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
const parseTargetType = (raw) => {
    if (raw === "election-result")
        return "election_result";
    if (raw === "incident-report")
        return "incident_report";
    return null;
};
export const getMobileCollation = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        if (!isValidObjectId(activeElectionId)) {
            return res.status(400).json({ message: "Invalid election id" });
        }
        const userId = requireUserId(r);
        const data = await getMobileCollationBundle(activeElectionId, userId);
        return res.status(200).json(data);
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("not available for your location")) {
            return res.status(403).json({ message });
        }
        if (message === "Election not found" ||
            message === "User not found" ||
            message === "Active Election not found") {
            return res.status(404).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const postMobileCollationUserAction = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        if (!isValidObjectId(activeElectionId)) {
            return res.status(400).json({ message: "Invalid election id" });
        }
        const userId = requireUserId(r);
        const { electionId, action, dataType, flagReason } = req.body;
        const actionData = electionId && action && dataType
            ? {
                electionId,
                action: action,
                dataType: dataType,
                flagReason,
            }
            : null;
        if (actionData && !isValidObjectId(actionData.electionId)) {
            return res.status(400).json({ message: "Invalid target id" });
        }
        const results = await mobileCollationUserAction(activeElectionId, userId, actionData);
        return res.status(200).json({
            message: actionData
                ? "Updated successfully"
                : "Fetched polling-unit verification feed (legacy)",
            results,
        });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("not available for your location")) {
            return res.status(403).json({ message });
        }
        return res.status(400).json({ message });
    }
};
export const getReportThreadCommentsMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        const targetTypeRaw = asParamString(req.params.targetType);
        const targetId = asParamString(req.params.targetId);
        if (!isValidObjectId(activeElectionId) || !isValidObjectId(targetId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const targetType = parseTargetType(targetTypeRaw);
        if (!targetType) {
            return res.status(400).json({ message: "Invalid target type" });
        }
        const userId = requireUserId(r);
        const comments = await listReportThreadComments(activeElectionId, userId, targetType, targetId);
        return res.status(200).json({ comments });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("not available") || message.includes("location")) {
            return res.status(403).json({ message });
        }
        if (message.includes("not found")) {
            return res.status(404).json({ message });
        }
        return res.status(500).json({ message });
    }
};
export const postReportThreadCommentMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        const targetTypeRaw = asParamString(req.params.targetType);
        const targetId = asParamString(req.params.targetId);
        if (!isValidObjectId(activeElectionId) || !isValidObjectId(targetId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const targetType = parseTargetType(targetTypeRaw);
        if (!targetType) {
            return res.status(400).json({ message: "Invalid target type" });
        }
        const userId = requireUserId(r);
        const body = String(req.body?.body ?? "").trim();
        const useAnonymousDisplay = toBooleanIfBooleanLike(req.body?.useAnonymousDisplay);
        if (!body) {
            return res.status(400).json({ message: "body is required" });
        }
        const comment = await addReportThreadComment(activeElectionId, userId, {
            targetType,
            targetId,
            body,
            useAnonymousDisplay,
        });
        return res.status(201).json({ comment });
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("anonymous username")) {
            return res.status(400).json({ message });
        }
        if (message.includes("location")) {
            return res.status(403).json({ message });
        }
        return res.status(400).json({ message });
    }
};
export const postReportCommentLikeMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        const commentId = asParamString(req.params.commentId);
        if (!isValidObjectId(activeElectionId) || !isValidObjectId(commentId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userId = requireUserId(r);
        const comment = await toggleReportCommentLike(activeElectionId, userId, commentId);
        return res.status(200).json({ comment });
    }
    catch (error) {
        return res.status(400).json({ message: errMsg(error) });
    }
};
export const getDiscussionPostsMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        if (!isValidObjectId(activeElectionId)) {
            return res.status(400).json({ message: "Invalid election id" });
        }
        const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
        const userId = requireUserId(r);
        const data = await listDiscussionPosts(activeElectionId, userId, page, limit);
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(400).json({ message: errMsg(error) });
    }
};
export const postDiscussionPostMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        if (!isValidObjectId(activeElectionId)) {
            return res.status(400).json({ message: "Invalid election id" });
        }
        const userId = requireUserId(r);
        const b = req.body;
        const body = String(b.body ?? "").trim();
        if (!body)
            return res.status(400).json({ message: "body is required" });
        const post = await createDiscussionPost(activeElectionId, userId, {
            body,
            imageUrls: Array.isArray(b.imageUrls) ? b.imageUrls.map(String) : undefined,
            videoUrls: Array.isArray(b.videoUrls) ? b.videoUrls.map(String) : undefined,
            visibilityScope: b.visibilityScope === "ward" ? "ward" : "lga",
            allowSocialShare: toBooleanIfBooleanLike(b.allowSocialShare),
            useAnonymousDisplay: toBooleanIfBooleanLike(b.useAnonymousDisplay),
        }, {
            images: r.files?.["images[]"],
            videos: r.files?.["videos[]"],
        });
        return res.status(201).json({ post });
    }
    catch (error) {
        return res.status(400).json({ message: errMsg(error) });
    }
};
export const postDiscussionPostLikeMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(activeElectionId) || !isValidObjectId(postId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userId = requireUserId(r);
        const data = await toggleDiscussionPostLike(activeElectionId, userId, postId);
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(400).json({ message: errMsg(error) });
    }
};
export const getDiscussionPostCommentsMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(activeElectionId) || !isValidObjectId(postId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userId = requireUserId(r);
        const comments = await listPostComments(activeElectionId, userId, postId);
        return res.status(200).json({ comments });
    }
    catch (error) {
        return res.status(400).json({ message: errMsg(error) });
    }
};
export const postDiscussionPostCommentMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        const postId = asParamString(req.params.postId);
        if (!isValidObjectId(activeElectionId) || !isValidObjectId(postId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userId = requireUserId(r);
        const body = String(req.body?.body ?? "").trim();
        const useAnonymousDisplay = toBooleanIfBooleanLike(req.body?.useAnonymousDisplay);
        if (!body)
            return res.status(400).json({ message: "body is required" });
        const comment = await addPostComment(activeElectionId, userId, postId, {
            body,
            useAnonymousDisplay,
        });
        return res.status(201).json({ comment });
    }
    catch (error) {
        return res.status(400).json({ message: errMsg(error) });
    }
};
export const postDiscussionPostCommentLikeMobile = async (req, res) => {
    try {
        const r = req;
        const activeElectionId = asParamString(req.params.activeElectionId);
        const postId = asParamString(req.params.postId);
        const commentId = asParamString(req.params.commentId);
        if (!isValidObjectId(activeElectionId) ||
            !isValidObjectId(postId) ||
            !isValidObjectId(commentId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userId = requireUserId(r);
        const comment = await togglePostCommentLike(activeElectionId, userId, postId, commentId);
        return res.status(200).json({ comment });
    }
    catch (error) {
        return res.status(400).json({ message: errMsg(error) });
    }
};
//# sourceMappingURL=collationController.js.map