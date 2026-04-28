import CompletedUser from "../../models/CompletedUser.js";
import PulsePost from "../../models/Pulse/PulsePost.js";
import PulseComment from "../../models/Pulse/PulseComment.js";
import { uploadFileToFirebase } from "../../config/firebaseUploader.js";
import { dispatchNotificationToUsers } from "./notificationDispatchService.js";
const normalizeLocationKey = (value) => String(value ?? "")
    .trim()
    .toLowerCase();
const formatAuthorDisplay = (author, useAnonymousDisplay) => {
    if (!author)
        return { displayName: "Member", usedAnonymous: false };
    if (useAnonymousDisplay && author.anonymousUsername) {
        return { displayName: `@${author.anonymousUsername}`, usedAnonymous: true };
    }
    const name = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
    return { displayName: name || "Member", usedAnonymous: false };
};
const assertPulseLocation = (user, scope) => {
    const state = normalizeLocationKey(user.state);
    const lga = normalizeLocationKey(user.lga);
    const ward = normalizeLocationKey(user.ward);
    if (!state || !lga) {
        throw new Error("Complete your state and LGA in profile to use Pulse");
    }
    if (scope === "ward" && !ward) {
        throw new Error("Complete your ward in profile to post to ward Pulse");
    }
    return { state, lga, ward };
};
const ensureViewer = async (userId) => {
    const user = await CompletedUser.findById(userId).lean();
    if (!user)
        throw new Error("User not found");
    return user;
};
const buildViewerFilter = (viewer) => {
    const loc = assertPulseLocation(viewer, "lga");
    return {
        $or: [
            {
                visibilityScope: "lga",
                audienceState: loc.state,
                audienceLga: loc.lga,
            },
            {
                visibilityScope: "ward",
                audienceState: loc.state,
                audienceLga: loc.lga,
                audienceWard: loc.ward,
            },
        ],
    };
};
const serializePulseComment = (row, viewerUserId) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    const { displayName, usedAnonymous } = formatAuthorDisplay(row.author, Boolean(row.useAnonymousDisplay));
    return {
        id: String(row._id),
        body: row.body,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: {
            id: row.author?._id != null ? String(row.author._id) : undefined,
            displayName,
            usedAnonymous,
        },
        likesCount: likes.length,
        isLikedByCurrentUser: likes.some((l) => l.user != null && String(l.user) === String(viewerUserId)),
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
export const listPulsePosts = async (userId, page = 1, limit = 20) => {
    const viewer = await ensureViewer(userId);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = Math.max(0, (page - 1) * safeLimit);
    const locationFilter = buildViewerFilter(viewer);
    const [rows, total] = await Promise.all([
        PulsePost.find(locationFilter)
            .populate("author", "firstName lastName anonymousUsername")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean(),
        PulsePost.countDocuments(locationFilter),
    ]);
    const postIds = rows.map((r) => r._id);
    const commentCounts = await PulseComment.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);
    const commentCountByPost = new Map(commentCounts.map((entry) => [String(entry._id), entry.count]));
    const posts = rows.map((row) => {
        const likes = Array.isArray(row.likes) ? row.likes : [];
        const { displayName, usedAnonymous } = formatAuthorDisplay(row.author, Boolean(row.useAnonymousDisplay));
        return {
            id: String(row._id),
            body: row.body,
            imageUrl: row.imageUrl ?? null,
            visibilityScope: row.visibilityScope ?? "lga",
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            author: {
                id: row.author?._id != null ? String(row.author._id) : undefined,
                displayName,
                usedAnonymous,
            },
            likesCount: likes.length,
            commentsCount: commentCountByPost.get(String(row._id)) ?? 0,
            isLikedByCurrentUser: likes.some((l) => l.user != null && String(l.user) === String(userId)),
        };
    });
    return { posts, total, page, limit: safeLimit };
};
export const createPulsePost = async (userId, input, media) => {
    const author = await ensureViewer(userId);
    const visibilityScope = input.visibilityScope === "ward" ? "ward" : "lga";
    const audienceLoc = assertPulseLocation(author, visibilityScope);
    const useAnonymous = Boolean(input.useAnonymousDisplay);
    if (useAnonymous && !author.anonymousUsername) {
        throw new Error("Set an anonymous username before posting anonymously");
    }
    const uploadedImageUrl = media?.image
        ? (await uploadFileToFirebase(media.image, `pulse/posts/${audienceLoc.state}/${audienceLoc.lga}`)).publicUrl
        : undefined;
    const created = await PulsePost.create({
        author: userId,
        body: input.body.trim(),
        imageUrl: uploadedImageUrl,
        visibilityScope,
        audienceState: audienceLoc.state,
        audienceLga: audienceLoc.lga,
        audienceWard: visibilityScope === "ward" ? audienceLoc.ward : undefined,
        useAnonymousDisplay: useAnonymous,
        likes: [],
    });
    const populated = await PulsePost.findById(created._id)
        .populate("author", "firstName lastName anonymousUsername")
        .lean();
    const likes = Array.isArray(populated?.likes) ? populated.likes : [];
    const { displayName, usedAnonymous } = formatAuthorDisplay(populated?.author, Boolean(populated?.useAnonymousDisplay));
    return {
        id: String(populated._id),
        body: populated.body,
        imageUrl: populated.imageUrl ?? null,
        visibilityScope: populated.visibilityScope ?? "lga",
        createdAt: populated.createdAt,
        updatedAt: populated.updatedAt,
        author: {
            id: populated?.author?._id != null
                ? String(populated.author._id)
                : undefined,
            displayName,
            usedAnonymous,
        },
        likesCount: likes.length,
        commentsCount: 0,
        isLikedByCurrentUser: likes.some((l) => String(l.user) === String(userId)),
    };
};
export const togglePulsePostLike = async (userId, postId) => {
    await assertPostVisibleToUser(postId, userId);
    const post = await PulsePost.findById(postId);
    if (!post)
        throw new Error("Post not found");
    const likes = post.likes ?? [];
    const idx = likes.findIndex((l) => String(l.user) === String(userId));
    if (idx >= 0)
        likes.splice(idx, 1);
    else
        likes.push({ user: userId });
    post.likes = likes;
    await post.save();
    return {
        id: String(post._id),
        likesCount: likes.length,
        isLikedByCurrentUser: idx < 0,
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
export const addPulsePostComment = async (userId, postId, input) => {
    const { post } = await assertPostVisibleToUser(postId, userId);
    const author = await ensureViewer(userId);
    const useAnonymous = Boolean(input.useAnonymousDisplay);
    if (useAnonymous && !author.anonymousUsername) {
        throw new Error("Set an anonymous username before commenting anonymously");
    }
    const created = await PulseComment.create({
        post: postId,
        author: userId,
        body: input.body.trim(),
        useAnonymousDisplay: useAnonymous,
        likes: [],
    });
    const populated = await PulseComment.findById(created._id)
        .populate("author", "firstName lastName anonymousUsername")
        .lean();
    if (post.author && String(post.author) !== String(userId)) {
        await dispatchNotificationToUsers({
            type: "discussion-reply",
            preferenceKey: "discussionReplies",
            body: "Someone replied to your pulse post.",
            info: String(input.body).slice(0, 120),
            userIds: [String(post.author)],
        });
    }
    return serializePulseComment(populated, userId);
};
export const togglePulseCommentLike = async (userId, postId, commentId) => {
    await assertPostVisibleToUser(postId, userId);
    const comment = await PulseComment.findOne({ _id: commentId, post: postId });
    if (!comment)
        throw new Error("Comment not found");
    const likes = comment.likes ?? [];
    const idx = likes.findIndex((l) => String(l.user) === String(userId));
    if (idx >= 0)
        likes.splice(idx, 1);
    else
        likes.push({ user: userId });
    comment.likes = likes;
    await comment.save();
    const populated = await PulseComment.findById(comment._id)
        .populate("author", "firstName lastName anonymousUsername")
        .lean();
    return serializePulseComment(populated, userId);
};
//# sourceMappingURL=pulseService.js.map