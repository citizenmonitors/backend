import mongoose from "mongoose";
import CompletedUser from "../../models/CompletedUser.js";
import PulsePost from "../../models/Pulse/PulsePost.js";
import PulseComment from "../../models/Pulse/PulseComment.js";
import PulseReport from "../../models/Pulse/PulseReport.js";
import UserBlock from "../../models/Pulse/UserBlock.js";
import { uploadFileToFirebase } from "../../config/firebaseUploader.js";
import { dispatchNotificationToUsers } from "./notificationDispatchService.js";
import { isValidObjectId } from "../../utils/validators.js";
/** Fields loaded for post/comment authors (name, anonymous handle, photo). */
const AUTHOR_FIELDS = "firstName lastName anonymousUsername profileImage.url";
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
export const formatAuthorDisplay = (author, useAnonymousDisplay) => {
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
export const PULSE_IMAGE_UPLOAD_FAILED_MESSAGE = "Your post was published without the image because the image could not be uploaded. Try adding it again later.";
/**
 * Image storage problems (e.g. Firebase billing) must not block posting.
 * Returns the URL, or `failed: true` so the caller can publish without the image.
 */
const tryUploadPulseImage = async (image, folder) => {
    if (!image)
        return { failed: false };
    try {
        return { url: (await uploadFileToFirebase(image, folder)).publicUrl, failed: false };
    }
    catch (error) {
        console.error("Pulse image upload failed; publishing without image:", error);
        return { failed: true };
    }
};
const ensureViewer = async (userId) => {
    const user = await CompletedUser.findById(userId).lean();
    if (!user)
        throw new Error("User not found");
    return user;
};
/** Users hidden from the viewer: those they blocked and those who blocked them. */
export const hiddenUserIdsFor = async (viewerUserId) => {
    const rows = await UserBlock.find({
        $or: [{ blocker: viewerUserId }, { blocked: viewerUserId }],
    })
        .select("blocker blocked")
        .lean();
    const viewer = String(viewerUserId);
    const ids = new Set();
    for (const row of rows) {
        const other = String(row.blocker) === viewer ? String(row.blocked) : String(row.blocker);
        ids.add(other);
    }
    return [...ids];
};
/** Throws when either user has blocked the other. */
export const assertNotBlockedBetween = async (userId, otherUserId) => {
    if (otherUserId == null)
        return;
    const other = String(otherUserId);
    if (!isValidObjectId(other) || other === String(userId))
        return;
    const blocked = await UserBlock.exists({
        $or: [
            { blocker: userId, blocked: other },
            { blocker: other, blocked: userId },
        ],
    });
    if (blocked)
        throw new Error("You can only interact with users you haven't blocked");
};
/** Feed filter that hides blocked users' posts, reposts of their posts, and posts the viewer reported. */
export const buildViewerSafetyFilter = async (viewerUserId) => {
    const [hiddenUserIds, reportedPostIds] = await Promise.all([
        hiddenUserIdsFor(viewerUserId),
        PulseReport.distinct("post", { reporter: viewerUserId, targetType: "post" }),
    ]);
    const clauses = [];
    if (hiddenUserIds.length) {
        // Any of their posts can be reposted or quoted (originals and quotes alike).
        const hiddenOriginalIds = await PulsePost.distinct("_id", {
            author: { $in: hiddenUserIds },
        });
        clauses.push({ author: { $nin: hiddenUserIds } });
        if (hiddenOriginalIds.length) {
            clauses.push({ repostedFrom: { $nin: hiddenOriginalIds } });
        }
    }
    if (reportedPostIds.length) {
        clauses.push({ _id: { $nin: reportedPostIds } });
        clauses.push({ repostedFrom: { $nin: reportedPostIds } });
    }
    return { filter: clauses.length ? { $and: clauses } : {}, hiddenUserIds };
};
/** Comment filter that hides blocked users' comments and comments the viewer reported. */
const buildCommentSafetyFilter = async (viewerUserId) => {
    if (!viewerUserId)
        return {};
    const [hiddenUserIds, reportedCommentIds] = await Promise.all([
        hiddenUserIdsFor(viewerUserId),
        PulseReport.distinct("comment", { reporter: viewerUserId, targetType: "comment" }),
    ]);
    const filter = {};
    if (hiddenUserIds.length)
        filter.author = { $nin: hiddenUserIds };
    if (reportedCommentIds.length)
        filter._id = { $nin: reportedCommentIds };
    return filter;
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
    const photo = String(author?.profileImage?.url ?? "").trim();
    return {
        // Never expose the account id or photo behind an anonymous name: either would
        // link the anonymous handle to the same person's named posts.
        id: !usedAnonymous && author?._id != null ? String(author._id) : null,
        displayName,
        usedAnonymous,
        avatarUrl: !usedAnonymous && /^https?:\/\//i.test(photo) ? photo : null,
    };
};
const isOwnedBy = (author, viewerUserId) => {
    if (!viewerUserId || author == null)
        return false;
    const authorId = typeof author === "object" && "_id" in author
        ? author._id
        : author;
    return authorId != null && String(authorId) === String(viewerUserId);
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
/** A plain repost points at its original; an original or a quote is its own target. */
const repostTargetIdOf = (row) => row.repostedFrom && !row.isQuote ? originalIdOf(row.repostedFrom) : String(row._id);
/** Target post ids (from the list) that the viewer has plainly reposted. */
const viewerRepostedTargets = async (viewerUserId, targetIds) => {
    if (!viewerUserId || targetIds.length === 0)
        return new Set();
    const ids = await PulsePost.distinct("repostedFrom", {
        author: viewerUserId,
        isQuote: { $ne: true },
        repostedFrom: { $in: targetIds },
    });
    return new Set(ids.map(String));
};
const serializeOriginalPost = (row, fallbackId, viewerUserId) => {
    if (row?._id) {
        return {
            id: String(row._id),
            body: row.body,
            imageUrl: row.imageUrl ?? null,
            isQuote: Boolean(row.isQuote),
            createdAt: row.createdAt,
            author: serializeAuthor(row.author, Boolean(row.useAnonymousDisplay)),
            isOwnedByCurrentUser: isOwnedBy(row.author, viewerUserId),
            unavailable: false,
        };
    }
    // The quoted/reposted post was deleted (quotes are kept, like on X).
    if (fallbackId)
        return { id: fallbackId, unavailable: true };
    return null;
};
const serializePulsePost = (row, viewerUserId, commentsCount = 0, extras = {}) => {
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
        isQuote: Boolean(row.isQuote),
        originalPost: serializeOriginalPost(typeof row.repostedFrom === "object" &&
            row.repostedFrom != null &&
            "_id" in row.repostedFrom &&
            "body" in row.repostedFrom
            ? row.repostedFrom
            : null, originalIdOf(row.repostedFrom), viewerUserId),
        repostCount: Number(row.repostCount ?? 0),
        quoteCount: Number(row.quoteCount ?? 0),
        isRepostedByCurrentUser: Boolean(extras.isRepostedByCurrentUser),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        // Only set when the text or image was edited; use this for an "Edited" label.
        editedAt: row.editedAt ?? null,
        author: serializeAuthor(row.author, Boolean(row.useAnonymousDisplay)),
        isOwnedByCurrentUser: isOwnedBy(row.author, viewerUserId),
        likesCount: likes.length,
        commentsCount,
        isLikedByCurrentUser: viewerUserId
            ? likes.some((l) => l.user != null && String(l.user) === String(viewerUserId))
            : false,
    };
};
const pulseAuthorPopulate = {
    path: "author",
    select: AUTHOR_FIELDS,
};
const pulseOriginalPopulate = {
    path: "repostedFrom",
    select: "body imageUrl useAnonymousDisplay isQuote createdAt author",
    populate: pulseAuthorPopulate,
};
const serializePulseComment = (row, viewerUserId) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    return {
        id: String(row._id),
        body: row.body,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        editedAt: row.editedAt ?? null,
        author: serializeAuthor(row.author, Boolean(row.useAnonymousDisplay)),
        isOwnedByCurrentUser: isOwnedBy(row.author, viewerUserId),
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
const commentCountsByPost = async (postIds, hiddenUserIds = []) => {
    if (postIds.length === 0)
        return new Map();
    const match = { post: { $in: postIds } };
    if (hiddenUserIds.length) {
        match.author = {
            $nin: hiddenUserIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
    }
    const commentCounts = await PulseComment.aggregate([
        { $match: match },
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
    const safety = input?.viewerUserId
        ? await buildViewerSafetyFilter(input.viewerUserId)
        : { filter: {}, hiddenUserIds: [] };
    const feedFilter = { ...locationFilter, ...safety.filter };
    const [rows, total] = await Promise.all([
        PulsePost.find(feedFilter)
            .populate(pulseAuthorPopulate)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean(),
        PulsePost.countDocuments(feedFilter),
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
    const commentCountByPost = await commentCountsByPost(rows.map((r) => r._id), safety.hiddenUserIds);
    const reposted = await viewerRepostedTargets(input?.viewerUserId, rows.map(repostTargetIdOf).filter((id) => Boolean(id)));
    const posts = rows.map((row) => serializePulsePost({
        ...row,
        repostedFrom: originalById.get(String(originalIdOf(row.repostedFrom))) ?? row.repostedFrom,
    }, input?.viewerUserId ?? null, commentCountByPost.get(String(row._id)) ?? 0, { isRepostedByCurrentUser: reposted.has(String(repostTargetIdOf(row))) }));
    return { posts, total, page, limit: safeLimit, scope };
};
/**
 * One post by id (shared links, tapped quotes, notifications).
 * Hidden the same way as the feed: blocked users' posts and posts the viewer reported
 * return "Post not found".
 */
export const getPulsePost = async (postId, viewerUserId) => {
    if (viewerUserId) {
        const safety = await buildViewerSafetyFilter(viewerUserId);
        const visible = await PulsePost.exists({ _id: postId, ...safety.filter });
        if (!visible)
            throw new Error("Post not found");
        const row = await PulsePost.findById(postId)
            .populate(pulseAuthorPopulate)
            .populate(pulseOriginalPopulate)
            .lean();
        if (!row)
            throw new Error("Post not found");
        const counts = await commentCountsByPost([row._id], safety.hiddenUserIds);
        const target = repostTargetIdOf({
            _id: row._id,
            repostedFrom: originalIdOf(row.repostedFrom),
            isQuote: row.isQuote,
        });
        const reposted = await viewerRepostedTargets(viewerUserId, target ? [target] : []);
        return serializePulsePost(row, viewerUserId, counts.get(String(row._id)) ?? 0, {
            isRepostedByCurrentUser: Boolean(target && reposted.has(target)),
        });
    }
    const row = await PulsePost.findById(postId)
        .populate(pulseAuthorPopulate)
        .populate(pulseOriginalPopulate)
        .lean();
    if (!row)
        throw new Error("Post not found");
    const counts = await commentCountsByPost([row._id]);
    return serializePulsePost(row, null, counts.get(String(row._id)) ?? 0);
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
    const upload = await tryUploadPulseImage(media?.image, uploadFolder);
    const uploadedImageUrl = upload.url;
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
    return { ...serializePulsePost(populated, userId, 0), imageUploadFailed: upload.failed };
};
/**
 * Repost like X.
 * - No body: plain repost (one per user per post, including your own).
 * - With body (and optional image): quote post with your own text on top. Many allowed,
 *   including quoting your own post.
 * Reposting a plain repost targets its original; reposting or quoting a quote targets
 * the quote itself.
 */
export const repostPulsePost = async (userId, postId, input = {}, media) => {
    const author = await ensureViewer(userId);
    const source = await PulsePost.findById(postId).lean();
    if (!source)
        throw new Error("Post not found");
    const target = source.repostedFrom && !source.isQuote
        ? await PulsePost.findById(source.repostedFrom).lean()
        : source;
    if (!target)
        throw new Error("Original post not found");
    const targetId = String(target._id);
    const quoteBody = String(input.body ?? "").trim();
    const isQuote = quoteBody.length > 0;
    if (!isQuote && media?.image) {
        throw new Error("Add some text to quote this post");
    }
    await assertNotBlockedBetween(userId, target.author);
    let created;
    let imageUploadFailed = false;
    if (isQuote) {
        if (quoteBody.length > 5000)
            throw new Error("body must be 5000 characters or fewer");
        const useAnonymous = Boolean(input.useAnonymousDisplay);
        if (useAnonymous && !author.anonymousUsername) {
            throw new Error("Set an anonymous username before posting anonymously");
        }
        const visibilityScope = parseVisibilityScope(input.visibilityScope, "all");
        const loc = assertPulseLocation(author, visibilityScope);
        const upload = await tryUploadPulseImage(media?.image, ["pulse/posts", loc.state || "all", loc.lga || "all"].join("/"));
        imageUploadFailed = upload.failed;
        const imageUrl = upload.url;
        created = await PulsePost.create({
            author: userId,
            body: quoteBody,
            imageUrl,
            visibilityScope,
            audienceState: loc.state || undefined,
            audienceLga: loc.lga || undefined,
            audienceWard: loc.ward || undefined,
            audiencePollingUnit: loc.pollingUnit || undefined,
            useAnonymousDisplay: useAnonymous,
            likes: [],
            repostedFrom: targetId,
            isQuote: true,
            repostCount: 0,
            quoteCount: 0,
        });
        await PulsePost.updateOne({ _id: targetId }, { $inc: { quoteCount: 1 } });
    }
    else {
        // Reposting your own post is allowed, like on X.
        const already = await PulsePost.exists({
            author: userId,
            repostedFrom: targetId,
            isQuote: { $ne: true },
        });
        if (already)
            throw new Error("You already reposted this post");
        const loc = readPulseLocation(author);
        created = await PulsePost.create({
            author: userId,
            body: String(target.body ?? "").trim(),
            imageUrl: target.imageUrl,
            visibilityScope: "all",
            audienceState: loc.state || undefined,
            audienceLga: loc.lga || undefined,
            audienceWard: loc.ward || undefined,
            audiencePollingUnit: loc.pollingUnit || undefined,
            useAnonymousDisplay: false,
            likes: [],
            repostedFrom: targetId,
            isQuote: false,
            repostCount: 0,
            quoteCount: 0,
        });
        await PulsePost.updateOne({ _id: targetId }, { $inc: { repostCount: 1 } });
    }
    if (target.author && String(target.author) !== String(userId)) {
        try {
            await dispatchNotificationToUsers({
                type: "discussion-reply",
                preferenceKey: "discussionReplies",
                body: isQuote ? "Someone quoted your pulse post." : "Someone reposted your pulse post.",
                info: (isQuote ? quoteBody : String(target.body ?? "")).slice(0, 120),
                userIds: [String(target.author)],
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
    return {
        ...serializePulsePost(populated, userId, 0, { isRepostedByCurrentUser: !isQuote }),
        imageUploadFailed,
    };
};
export const togglePulsePostLike = async (userId, postId) => {
    const { post } = await assertPostVisibleToUser(postId, userId);
    await assertNotBlockedBetween(userId, post.author);
    return togglePulsePostLikeCore(userId, postId);
};
/** Auth required, but no location restriction (web). */
export const togglePulsePostLikeAnyLocation = async (userId, postId) => {
    const post = await PulsePost.findById(postId).lean();
    if (!post)
        throw new Error("Post not found");
    await assertNotBlockedBetween(userId, post.author);
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
    const safety = await buildCommentSafetyFilter(userId);
    const rows = await PulseComment.find({ post: postId, ...safety })
        .populate("author", AUTHOR_FIELDS)
        .sort({ createdAt: -1 })
        .lean();
    return rows.map((row) => serializePulseComment(row, userId));
};
/** Public comments: no location restriction. Optional viewer marks likes. */
export const listPulsePostCommentsPublic = async (postId, viewerUserId) => {
    const post = await PulsePost.findById(postId).lean();
    if (!post)
        throw new Error("Post not found");
    const safety = await buildCommentSafetyFilter(viewerUserId);
    const rows = await PulseComment.find({ post: postId, ...safety })
        .populate("author", AUTHOR_FIELDS)
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
    await assertNotBlockedBetween(userId, postAuthor);
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
        .populate("author", AUTHOR_FIELDS)
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
    await assertNotBlockedBetween(userId, comment.author);
    const likeUserId = new mongoose.Types.ObjectId(String(userId));
    const alreadyLiked = (comment.likes ?? []).some((l) => l.user != null && String(l.user) === String(userId));
    const updated = await PulseComment.findOneAndUpdate({ _id: commentId, post: postId }, alreadyLiked
        ? { $pull: { likes: { user: likeUserId } } }
        : { $addToSet: { likes: { user: likeUserId } } }, { new: true })
        .populate("author", AUTHOR_FIELDS)
        .lean();
    if (!updated)
        throw new Error("Comment not found");
    return serializePulseComment(updated, userId);
};
/* ------------------------------------------------------------------ */
/* Edit / delete / unlike / undo repost                                */
/* ------------------------------------------------------------------ */
const loadPopulatedPost = async (postId, viewerUserId) => {
    const row = await PulsePost.findById(postId)
        .populate(pulseAuthorPopulate)
        .populate(pulseOriginalPopulate)
        .lean();
    if (!row)
        throw new Error("Post not found");
    const counts = await commentCountsByPost([row._id]);
    const target = repostTargetIdOf({
        _id: row._id,
        repostedFrom: originalIdOf(row.repostedFrom),
        isQuote: row.isQuote,
    });
    const reposted = await viewerRepostedTargets(viewerUserId, target ? [target] : []);
    return serializePulsePost(row, viewerUserId, counts.get(String(row._id)) ?? 0, {
        isRepostedByCurrentUser: Boolean(target && reposted.has(target)),
    });
};
/** Author only. Quotes can be edited; plain reposts can't (undo the repost instead). */
export const updatePulsePost = async (userId, postId, input, media) => {
    const post = await PulsePost.findById(postId).lean();
    if (!post)
        throw new Error("Post not found");
    if (String(post.author) !== String(userId)) {
        throw new Error("You can only edit your own post");
    }
    if (post.repostedFrom && !post.isQuote) {
        throw new Error("Reposts cannot be edited");
    }
    const author = await ensureViewer(userId);
    const set = {};
    const unset = {};
    if (input.body !== undefined) {
        const body = String(input.body ?? "").trim();
        if (!body)
            throw new Error("body must not be empty");
        if (body.length > 5000)
            throw new Error("body must be 5000 characters or fewer");
        set.body = body;
    }
    if (input.useAnonymousDisplay !== undefined) {
        if (input.useAnonymousDisplay && !author.anonymousUsername) {
            throw new Error("Set an anonymous username before posting anonymously");
        }
        set.useAnonymousDisplay = input.useAnonymousDisplay;
    }
    let audienceLoc = null;
    if (input.visibilityScope !== undefined && String(input.visibilityScope).trim() !== "") {
        const scope = parseVisibilityScope(input.visibilityScope, "all");
        audienceLoc = assertPulseLocation(author, scope);
        set.visibilityScope = scope;
        for (const [field, value] of [
            ["audienceState", audienceLoc.state],
            ["audienceLga", audienceLoc.lga],
            ["audienceWard", audienceLoc.ward],
            ["audiencePollingUnit", audienceLoc.pollingUnit],
        ]) {
            if (value)
                set[field] = value;
            else
                unset[field] = 1;
        }
    }
    let imageUploadFailed = false;
    if (media?.image) {
        const loc = audienceLoc ?? readPulseLocation(author);
        const folder = ["pulse/posts", loc.state || "all", loc.lga || "all"].join("/");
        const upload = await tryUploadPulseImage(media.image, folder);
        if (upload.url)
            set.imageUrl = upload.url;
        // Keep the existing image if the new one can't be uploaded.
        imageUploadFailed = upload.failed;
    }
    else if (input.removeImage) {
        unset.imageUrl = 1;
    }
    if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
        if (imageUploadFailed) {
            throw new Error("The image could not be uploaded right now. Try again later.");
        }
        throw new Error("Nothing to update");
    }
    if ("body" in set || "imageUrl" in set || unset.imageUrl) {
        set.editedAt = new Date();
    }
    const update = {};
    if (Object.keys(set).length)
        update.$set = set;
    if (Object.keys(unset).length)
        update.$unset = unset;
    await PulsePost.updateOne({ _id: postId }, update);
    // Plain reposts keep a copy of the original's body and image; keep them in sync.
    // Quotes have their own text and image, so they're left alone.
    const repostSync = {};
    if ("body" in set)
        repostSync.body = set.body;
    if ("imageUrl" in set)
        repostSync.imageUrl = set.imageUrl;
    if (Object.keys(repostSync).length || unset.imageUrl) {
        await PulsePost.updateMany({ repostedFrom: postId, isQuote: { $ne: true } }, {
            ...(Object.keys(repostSync).length ? { $set: repostSync } : {}),
            ...(unset.imageUrl ? { $unset: { imageUrl: 1 } } : {}),
        });
    }
    return { ...(await loadPopulatedPost(postId, userId)), imageUploadFailed };
};
/**
 * Author only.
 * - Deletes the post, its comments, and plain reposts of it (with their comments).
 * - Quotes of it are kept and show the original as unavailable, like on X.
 * - A deleted repost or quote lowers the target's repostCount / quoteCount.
 */
export const deletePulsePost = async (userId, postId) => {
    const post = await PulsePost.findById(postId).lean();
    if (!post)
        throw new Error("Post not found");
    if (String(post.author) !== String(userId)) {
        throw new Error("You can only delete your own post");
    }
    return deletePulsePostCore(post);
};
/** No ownership check — callers must authorize (author or admin). */
export const deletePulsePostCore = async (post) => {
    const plainRepostIds = (await PulsePost.find({ repostedFrom: post._id, isQuote: { $ne: true } })
        .select("_id")
        .lean()).map((r) => r._id);
    const allIds = [post._id, ...plainRepostIds];
    await PulseComment.deleteMany({ post: { $in: allIds } });
    const removed = await PulsePost.deleteMany({ _id: { $in: allIds } });
    // Only adjust counters if this call actually removed the post.
    if (post.repostedFrom && removed.deletedCount > 0) {
        const counter = post.isQuote ? "quoteCount" : "repostCount";
        await PulsePost.updateOne({ _id: post.repostedFrom, [counter]: { $gt: 0 } }, { $inc: { [counter]: -1 } });
    }
    return { id: String(post._id), deleted: true, repostsDeleted: plainRepostIds.length };
};
/**
 * Undo a plain repost. postId may be the reposted post or the viewer's own repost of it.
 * Quotes are removed with DELETE /posts/:quoteId instead.
 */
export const undoPulseRepost = async (userId, postId) => {
    const source = await PulsePost.findById(postId).select("repostedFrom isQuote").lean();
    if (!source)
        throw new Error("Post not found");
    const rootId = source.repostedFrom && !source.isQuote ? String(source.repostedFrom) : String(source._id);
    const repost = await PulsePost.findOneAndDelete({
        author: userId,
        repostedFrom: rootId,
        isQuote: { $ne: true },
    }).lean();
    if (!repost)
        throw new Error("You have not reposted this post");
    await PulseComment.deleteMany({ post: repost._id });
    const root = await PulsePost.findOneAndUpdate({ _id: rootId, repostCount: { $gt: 0 } }, { $inc: { repostCount: -1 } }, { new: true, select: "repostCount" }).lean();
    return {
        id: rootId,
        removedRepostId: String(repost._id),
        repostCount: Number(root?.repostCount ?? 0),
    };
};
/** Idempotent unlike (POST /like still toggles). */
export const unlikePulsePost = async (userId, postId) => {
    const likeUserId = new mongoose.Types.ObjectId(String(userId));
    const updated = await PulsePost.findByIdAndUpdate(postId, { $pull: { likes: { user: likeUserId } } }, { new: true, select: "likes" }).lean();
    if (!updated)
        throw new Error("Post not found");
    return {
        id: String(updated._id),
        likesCount: Array.isArray(updated.likes) ? updated.likes.length : 0,
        isLikedByCurrentUser: false,
    };
};
/** Comment author only. */
export const updatePulseComment = async (userId, postId, commentId, input) => {
    const comment = await PulseComment.findOne({ _id: commentId, post: postId }).lean();
    if (!comment)
        throw new Error("Comment not found");
    if (String(comment.author) !== String(userId)) {
        throw new Error("You can only edit your own comment");
    }
    const set = {};
    if (input.body !== undefined) {
        const body = String(input.body ?? "").trim();
        if (!body)
            throw new Error("body must not be empty");
        if (body.length > 3000)
            throw new Error("body must be 3000 characters or fewer");
        set.body = body;
    }
    if (input.useAnonymousDisplay !== undefined) {
        if (input.useAnonymousDisplay) {
            const author = await ensureViewer(userId);
            if (!author.anonymousUsername) {
                throw new Error("Set an anonymous username before commenting anonymously");
            }
        }
        set.useAnonymousDisplay = input.useAnonymousDisplay;
    }
    if (Object.keys(set).length === 0)
        throw new Error("Nothing to update");
    if ("body" in set)
        set.editedAt = new Date();
    const updated = await PulseComment.findOneAndUpdate({ _id: commentId, post: postId }, { $set: set }, { new: true })
        .populate("author", AUTHOR_FIELDS)
        .lean();
    if (!updated)
        throw new Error("Comment not found");
    return serializePulseComment(updated, userId);
};
/** The comment's author or the post's author can delete it. */
export const deletePulseComment = async (userId, postId, commentId) => {
    const comment = await PulseComment.findOne({ _id: commentId, post: postId }).lean();
    if (!comment)
        throw new Error("Comment not found");
    if (String(comment.author) !== String(userId)) {
        const post = await PulsePost.findById(postId).select("author").lean();
        if (!post || String(post.author) !== String(userId)) {
            throw new Error("You can only delete your own comment");
        }
    }
    await PulseComment.deleteOne({ _id: commentId });
    return { id: String(commentId), deleted: true };
};
/** Idempotent unlike (POST /like still toggles). */
export const unlikePulseComment = async (userId, postId, commentId) => {
    const likeUserId = new mongoose.Types.ObjectId(String(userId));
    const updated = await PulseComment.findOneAndUpdate({ _id: commentId, post: postId }, { $pull: { likes: { user: likeUserId } } }, { new: true })
        .populate("author", AUTHOR_FIELDS)
        .lean();
    if (!updated)
        throw new Error("Comment not found");
    return serializePulseComment(updated, userId);
};
//# sourceMappingURL=pulseService.js.map