import mongoose from "mongoose";
import CompletedUser from "../../models/CompletedUser.js";
import PulsePost from "../../models/Pulse/PulsePost.js";
import PulseComment from "../../models/Pulse/PulseComment.js";
import { uploadFileToFirebase } from "../../config/firebaseUploader.js";
import { dispatchNotificationToUsers } from "./notificationDispatchService.js";
import { isValidObjectId } from "../../utils/validators.js";
const VISIBILITY_SCOPES = [
    "all",
    "state",
    "lga",
    "ward",
    "polling-unit",
];
const normalizeLocationKey = (value) => String(value ?? "")
    .trim()
    .toLowerCase();
const firstQueryValue = (value) => Array.isArray(value) ? value[0] : value;
export const parsePulseFeedScope = (value) => {
    const first = firstQueryValue(value);
    if (first == null || String(first).trim() === "")
        return "all";
    const raw = String(first)
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");
    if (raw === "pollingunit" || raw === "pu" || raw === "polling-unit") {
        return "polling-unit";
    }
    if (VISIBILITY_SCOPES.includes(raw)) {
        return raw;
    }
    throw new Error("Invalid Pulse scope. Use all, state, lga, ward, or polling-unit");
};
export const parseVisibilityScope = (value, fallback = "all") => {
    const first = firstQueryValue(value);
    if (first == null || String(first).trim() === "")
        return fallback;
    return parsePulseFeedScope(first);
};
const formatAuthorDisplay = (author, useAnonymousDisplay) => {
    if (!author)
        return { displayName: "Member", usedAnonymous: false };
    if (useAnonymousDisplay && author.anonymousUsername) {
        return { displayName: `@${author.anonymousUsername}`, usedAnonymous: true };
    }
    const name = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
    return { displayName: name || "Member", usedAnonymous: false };
};
const readPulseLocation = (user) => ({
    state: normalizeLocationKey(user.state),
    lga: normalizeLocationKey(user.lga),
    ward: normalizeLocationKey(user.ward),
    pollingUnit: normalizeLocationKey(user.pollingUnit),
});
const assertPulseLocation = (user, scope) => {
    const loc = readPulseLocation(user);
    if (scope === "all")
        return loc;
    if (!loc.state) {
        throw new Error("Complete your state in your profile first");
    }
    if (scope === "state")
        return loc;
    if (!loc.lga) {
        throw new Error("Complete your LGA in your profile first");
    }
    if (scope === "lga")
        return loc;
    if (!loc.ward) {
        throw new Error("Complete your ward in your profile first");
    }
    if (scope === "ward")
        return loc;
    if (!loc.pollingUnit) {
        throw new Error("Complete your polling unit in your profile first");
    }
    return loc;
};
const ensureViewer = async (userId) => {
    const user = await CompletedUser.findById(userId).lean();
    if (!user)
        throw new Error("User not found");
    return user;
};
const buildFeedFilter = (scope, viewer) => {
    if (scope === "all")
        return {};
    if (!viewer) {
        throw new Error("Sign in to filter Pulse by your location");
    }
    const loc = assertPulseLocation(viewer, scope);
    if (scope === "state") {
        return { audienceState: loc.state };
    }
    if (scope === "lga") {
        return { audienceState: loc.state, audienceLga: loc.lga };
    }
    if (scope === "ward") {
        return {
            audienceState: loc.state,
            audienceLga: loc.lga,
            audienceWard: loc.ward,
        };
    }
    return {
        audienceState: loc.state,
        audienceLga: loc.lga,
        audienceWard: loc.ward,
        audiencePollingUnit: loc.pollingUnit,
    };
};
/** @deprecated location-gated feed; prefer buildFeedFilter */
const buildViewerFilter = (viewer) => buildFeedFilter("lga", viewer);
const serializeAuthor = (author, useAnonymousDisplay) => {
    const { displayName, usedAnonymous } = formatAuthorDisplay(author, useAnonymousDisplay);
    return {
        id: author?._id != null ? String(author._id) : undefined,
        displayName,
        usedAnonymous,
    };
};
const originalIdOf = (value) => {
    if (!value)
        return null;
    if (typeof value === "string")
        return isValidObjectId(value) ? value : null;
    if (typeof value === "object" && value !== null && "_id" in value) {
        const id = value._id;
        if (id != null) {
            const asString = String(id);
            return isValidObjectId(asString) ? asString : null;
        }
    }
    const asString = String(value);
    return isValidObjectId(asString) ? asString : null;
};
const serializeOriginalPost = (row, fallbackId) => {
    if (row?._id) {
        return {
            id: String(row._id),
            body: row.body,
            imageUrl: row.imageUrl ?? null,
            author: serializeAuthor(row.author, Boolean(row.useAnonymousDisplay)),
        };
    }
    if (fallbackId)
        return { id: fallbackId };
    return null;
};
const serializePulsePost = (row, viewerUserId, commentsCount = 0) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    return {
        id: String(row._id),
        body: row.body,
        imageUrl: row.imageUrl ?? null,
        visibilityScope: row.visibilityScope ?? "all",
        audienceState: row.audienceState ?? null,
        audienceLga: row.audienceLga ?? null,
        audienceWard: row.audienceWard ?? null,
        audiencePollingUnit: row.audiencePollingUnit ?? null,
        isRepost: Boolean(originalIdOf(row.repostedFrom)),
        originalPost: serializeOriginalPost(typeof row.repostedFrom === "object" &&
            row.repostedFrom != null &&
            "_id" in row.repostedFrom &&
            "body" in row.repostedFrom
            ? row.repostedFrom
            : null, originalIdOf(row.repostedFrom)),
        repostCount: Number(row.repostCount ?? 0),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: serializeAuthor(row.author, Boolean(row.useAnonymousDisplay)),
        likesCount: likes.length,
        commentsCount,
        isLikedByCurrentUser: viewerUserId
            ? likes.some((l) => l.user != null && String(l.user) === String(viewerUserId))
            : false,
    };
};
const pulseAuthorPopulate = {
    path: "author",
    select: "firstName lastName anonymousUsername",
};
const pulseOriginalPopulate = {
    path: "repostedFrom",
    select: "body imageUrl useAnonymousDisplay author",
    populate: pulseAuthorPopulate,
};
const serializePulseComment = (row, viewerUserId) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    return {
        id: String(row._id),
        body: row.body,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: serializeAuthor(row.author, Boolean(row.useAnonymousDisplay)),
        likesCount: likes.length,
        isLikedByCurrentUser: viewerUserId
            ? likes.some((l) => l.user != null && String(l.user) === String(viewerUserId))
            : false,
    };
};
const assertPostVisibleToUser = async (postId, userId) => {
    const viewer = await ensureViewer(userId);
    const post = await PulsePost.findById(postId).lean();
    if (!post)
        throw new Error("Post not found");
    const filter = buildViewerFilter(viewer);
    const visible = await PulsePost.exists({ _id: postId, ...filter });
    if (!visible) {
        throw new Error("Post is not available for your location");
    }
    return { viewer, post };
};
const commentCountsByPost = async (postIds) => {
    if (postIds.length === 0)
        return new Map();
    const commentCounts = await PulseComment.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);
    return new Map(commentCounts.map((entry) => [String(entry._id), entry.count]));
};
export const listPulseFeed = async (input) => {
    const scope = parsePulseFeedScope(input?.scope);
    const safeLimit = Math.min(50, Math.max(1, input?.limit ?? 20));
    const page = Math.max(1, input?.page ?? 1);
    const skip = Math.max(0, (page - 1) * safeLimit);
    let viewer = null;
    if (input?.viewerUserId) {
        viewer = await ensureViewer(input.viewerUserId);
    }
    const locationFilter = buildFeedFilter(scope, viewer);
    const [rows, total] = await Promise.all([
        PulsePost.find(locationFilter)
            .populate(pulseAuthorPopulate)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean(),
        PulsePost.countDocuments(locationFilter),
    ]);
    const originalIds = [
        ...new Set(rows
            .map((row) => originalIdOf(row.repostedFrom))
            .filter((id) => Boolean(id) && isValidObjectId(id))),
    ];
    const originals = originalIds.length
        ? await PulsePost.find({ _id: { $in: originalIds } })
            .populate(pulseAuthorPopulate)
            .lean()
        : [];
    const originalById = new Map(originals.map((row) => [String(row._id), row]));
    const commentCountByPost = await commentCountsByPost(rows.map((r) => r._id));
    const posts = rows.map((row) => serializePulsePost({
        ...row,
        repostedFrom: originalById.get(String(originalIdOf(row.repostedFrom))) ?? row.repostedFrom,
    }, input?.viewerUserId ?? null, commentCountByPost.get(String(row._id)) ?? 0));
    return { posts, total, page, limit: safeLimit, scope };
};
export const listPulsePosts = async (userId, page = 1, limit = 20, scope = "all") => listPulseFeed({
    page,
    limit,
    scope,
    viewerUserId: userId,
});
/** Public web feed: no auth required for scope=all. */
export const listPulsePostsPublic = async (page = 1, limit = 20, scope = "all", viewerUserId) => listPulseFeed({
    page,
    limit,
    scope,
    viewerUserId,
});
export const createPulsePost = async (userId, input, media) => {
    const author = await ensureViewer(userId);
    const visibilityScope = parseVisibilityScope(input.visibilityScope, "all");
    const audienceLoc = assertPulseLocation(author, visibilityScope);
    const body = input.body.trim();
    if (body.length > 5000) {
        throw new Error("body must be 5000 characters or fewer");
    }
    const useAnonymous = Boolean(input.useAnonymousDisplay);
    if (useAnonymous && !author.anonymousUsername) {
        throw new Error("Set an anonymous username before posting anonymously");
    }
    const uploadFolder = [
        "pulse/posts",
        audienceLoc.state || "all",
        audienceLoc.lga || "all",
    ].join("/");
    const uploadedImageUrl = media?.image
        ? (await uploadFileToFirebase(media.image, uploadFolder)).publicUrl
        : undefined;
    const created = await PulsePost.create({
        author: userId,
        body,
        imageUrl: uploadedImageUrl,
        visibilityScope,
        audienceState: audienceLoc.state || undefined,
        audienceLga: audienceLoc.lga || undefined,
        audienceWard: audienceLoc.ward || undefined,
        audiencePollingUnit: audienceLoc.pollingUnit || undefined,
        useAnonymousDisplay: useAnonymous,
        likes: [],
        repostCount: 0,
    });
    const populated = await PulsePost.findById(created._id)
        .populate(pulseAuthorPopulate)
        .populate(pulseOriginalPopulate)
        .lean();
    return serializePulsePost(populated, userId, 0);
};
export const repostPulsePost = async (userId, postId) => {
    const author = await ensureViewer(userId);
    const source = await PulsePost.findById(postId).lean();
    if (!source)
        throw new Error("Post not found");
    const rootId = source.repostedFrom ? String(source.repostedFrom) : String(source._id);
    const root = source.repostedFrom
        ? await PulsePost.findById(rootId).lean()
        : source;
    if (!root)
        throw new Error("Original post not found");
    if (String(root.author) === String(userId)) {
        throw new Error("You cannot repost your own post");
    }
    const already = await PulsePost.exists({ author: userId, repostedFrom: rootId });
    if (already)
        throw new Error("You already reposted this post");
    const loc = readPulseLocation(author);
    let created;
    try {
        created = await PulsePost.create({
            author: userId,
            body: String(root.body ?? "").trim(),
            imageUrl: root.imageUrl,
            visibilityScope: "all",
            audienceState: loc.state || undefined,
            audienceLga: loc.lga || undefined,
            audienceWard: loc.ward || undefined,
            audiencePollingUnit: loc.pollingUnit || undefined,
            useAnonymousDisplay: false,
            likes: [],
            repostedFrom: rootId,
            repostCount: 0,
        });
    }
    catch (error) {
        const duplicate = typeof error === "object" &&
            error != null &&
            "code" in error &&
            error.code === 11000;
        if (duplicate)
            throw new Error("You already reposted this post");
        throw error;
    }
    try {
        await PulsePost.updateOne({ _id: rootId }, { $inc: { repostCount: 1 } });
    }
    catch (error) {
        console.error("Pulse repost count update failed:", error);
    }
    if (root.author && String(root.author) !== String(userId)) {
        try {
            await dispatchNotificationToUsers({
                type: "discussion-reply",
                preferenceKey: "discussionReplies",
                body: "Someone reposted your pulse post.",
                info: String(root.body ?? "").slice(0, 120),
                userIds: [String(root.author)],
            });
        }
        catch (error) {
            console.error("Pulse repost notification failed:", error);
        }
    }
    const populated = await PulsePost.findById(created._id)
        .populate(pulseAuthorPopulate)
        .populate(pulseOriginalPopulate)
        .lean();
    return serializePulsePost(populated, userId, 0);
};
export const togglePulsePostLike = async (userId, postId) => {
    await assertPostVisibleToUser(postId, userId);
    return togglePulsePostLikeCore(userId, postId);
};
/** Auth required, but no location restriction (web). */
export const togglePulsePostLikeAnyLocation = async (userId, postId) => {
    const post = await PulsePost.findById(postId).lean();
    if (!post)
        throw new Error("Post not found");
    return togglePulsePostLikeCore(userId, postId);
};
const togglePulsePostLikeCore = async (userId, postId) => {
    const existing = await PulsePost.findById(postId).select("likes").lean();
    if (!existing)
        throw new Error("Post not found");
    const likeUserId = new mongoose.Types.ObjectId(String(userId));
    const alreadyLiked = (existing.likes ?? []).some((l) => l.user != null && String(l.user) === String(userId));
    const updated = await PulsePost.findByIdAndUpdate(postId, alreadyLiked
        ? { $pull: { likes: { user: likeUserId } } }
        : { $addToSet: { likes: { user: likeUserId } } }, { new: true, select: "likes" }).lean();
    if (!updated)
        throw new Error("Post not found");
    const likes = Array.isArray(updated.likes) ? updated.likes : [];
    return {
        id: String(updated._id),
        likesCount: likes.length,
        isLikedByCurrentUser: !alreadyLiked,
    };
};
export const listPulsePostComments = async (userId, postId) => {
    await assertPostVisibleToUser(postId, userId);
    const rows = await PulseComment.find({ post: postId })
        .populate("author", "firstName lastName anonymousUsername")
        .sort({ createdAt: -1 })
        .lean();
    return rows.map((row) => serializePulseComment(row, userId));
};
/** Public comments: no location restriction. Optional viewer marks likes. */
export const listPulsePostCommentsPublic = async (postId, viewerUserId) => {
    const post = await PulsePost.findById(postId).lean();
    if (!post)
        throw new Error("Post not found");
    const rows = await PulseComment.find({ post: postId })
        .populate("author", "firstName lastName anonymousUsername")
        .sort({ createdAt: -1 })
        .lean();
    return rows.map((row) => serializePulseComment(row, viewerUserId ?? null));
};
export const addPulsePostComment = async (userId, postId, input) => {
    const { post } = await assertPostVisibleToUser(postId, userId);
    return addPulsePostCommentCore(userId, postId, input, post.author);
};
/** Auth required; no location gate (for public web feed engagement). */
export const addPulsePostCommentAnyLocation = async (userId, postId, input) => {
    const post = await PulsePost.findById(postId).lean();
    if (!post)
        throw new Error("Post not found");
    return addPulsePostCommentCore(userId, postId, input, post.author);
};
const addPulsePostCommentCore = async (userId, postId, input, postAuthor) => {
    const author = await ensureViewer(userId);
    const useAnonymous = Boolean(input.useAnonymousDisplay);
    if (useAnonymous && !author.anonymousUsername) {
        throw new Error("Set an anonymous username before commenting anonymously");
    }
    const body = input.body.trim();
    if (body.length > 3000) {
        throw new Error("body must be 3000 characters or fewer");
    }
    const created = await PulseComment.create({
        post: postId,
        author: userId,
        body,
        useAnonymousDisplay: useAnonymous,
        likes: [],
    });
    const populated = await PulseComment.findById(created._id)
        .populate("author", "firstName lastName anonymousUsername")
        .lean();
    if (postAuthor && String(postAuthor) !== String(userId)) {
        try {
            await dispatchNotificationToUsers({
                type: "discussion-reply",
                preferenceKey: "discussionReplies",
                body: "Someone replied to your pulse post.",
                info: body.slice(0, 120),
                userIds: [String(postAuthor)],
            });
        }
        catch (error) {
            console.error("Pulse comment notification failed:", error);
        }
    }
    return serializePulseComment(populated, userId);
};
export const togglePulseCommentLike = async (userId, postId, commentId) => {
    await assertPostVisibleToUser(postId, userId);
    return togglePulseCommentLikeCore(userId, postId, commentId);
};
/** Auth required; no location gate (for public web feed engagement). */
export const togglePulseCommentLikeAnyLocation = async (userId, postId, commentId) => {
    const post = await PulsePost.exists({ _id: postId });
    if (!post)
        throw new Error("Post not found");
    return togglePulseCommentLikeCore(userId, postId, commentId);
};
const togglePulseCommentLikeCore = async (userId, postId, commentId) => {
    const comment = await PulseComment.findOne({ _id: commentId, post: postId });
    if (!comment)
        throw new Error("Comment not found");
    const likeUserId = new mongoose.Types.ObjectId(String(userId));
    const alreadyLiked = (comment.likes ?? []).some((l) => l.user != null && String(l.user) === String(userId));
    const updated = await PulseComment.findOneAndUpdate({ _id: commentId, post: postId }, alreadyLiked
        ? { $pull: { likes: { user: likeUserId } } }
        : { $addToSet: { likes: { user: likeUserId } } }, { new: true })
        .populate("author", "firstName lastName anonymousUsername")
        .lean();
    if (!updated)
        throw new Error("Comment not found");
    return serializePulseComment(updated, userId);
};
//# sourceMappingURL=pulseService.js.map