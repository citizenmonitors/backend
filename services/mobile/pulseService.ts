import type { Types } from "mongoose";
import CompletedUser from "../../models/CompletedUser.ts";
import PulsePost from "../../models/Pulse/PulsePost.ts";
import PulseComment from "../../models/Pulse/PulseComment.ts";
import { uploadFileToFirebase } from "../../config/firebaseUploader.ts";
import { dispatchNotificationToUsers } from "./notificationDispatchService.ts";

type Id = Types.ObjectId | string;
type VisibilityScope = "ward" | "lga";
type MulterMemoryFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};
type AuthorLean = {
  _id?: Id;
  firstName?: string | null;
  lastName?: string | null;
  anonymousUsername?: string | null;
};

const normalizeLocationKey = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const formatAuthorDisplay = (
  author: AuthorLean | null | undefined,
  useAnonymousDisplay: boolean
): { displayName: string; usedAnonymous: boolean } => {
  if (!author) return { displayName: "Member", usedAnonymous: false };
  if (useAnonymousDisplay && author.anonymousUsername) {
    return { displayName: `@${author.anonymousUsername}`, usedAnonymous: true };
  }
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
  return { displayName: name || "Member", usedAnonymous: false };
};

const assertPulseLocation = (
  user: { state?: string | null; lga?: string | null; ward?: string | null },
  scope: VisibilityScope
) => {
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

const ensureViewer = async (userId: Id) => {
  const user = await CompletedUser.findById(userId).lean();
  if (!user) throw new Error("User not found");
  return user;
};

const buildViewerFilter = (viewer: {
  state?: string | null;
  lga?: string | null;
  ward?: string | null;
}) => {
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

const serializePulseComment = (
  row: {
    _id: Id;
    body?: string;
    useAnonymousDisplay?: boolean;
    likes?: { user?: Id }[];
    author?: AuthorLean | null;
    createdAt?: Date;
    updatedAt?: Date;
  },
  viewerUserId: Id
) => {
  const likes = Array.isArray(row.likes) ? row.likes : [];
  const { displayName, usedAnonymous } = formatAuthorDisplay(
    row.author,
    Boolean(row.useAnonymousDisplay)
  );
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
    isLikedByCurrentUser: likes.some(
      (l) => l.user != null && String(l.user) === String(viewerUserId)
    ),
  };
};

const assertPostVisibleToUser = async (postId: string, userId: Id) => {
  const viewer = await ensureViewer(userId);
  const post = await PulsePost.findById(postId).lean();
  if (!post) throw new Error("Post not found");

  const filter = buildViewerFilter(viewer);
  const visible = await PulsePost.exists({ _id: postId, ...filter });
  if (!visible) {
    throw new Error("Post is not available for your location");
  }

  return { viewer, post };
};

export const listPulsePosts = async (userId: Id, page = 1, limit = 20) => {
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
  const commentCounts = await PulseComment.aggregate<{ _id: Id; count: number }>([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: "$post", count: { $sum: 1 } } },
  ]);
  const commentCountByPost = new Map(
    commentCounts.map((entry) => [String(entry._id), entry.count])
  );

  const posts = rows.map((row) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    const { displayName, usedAnonymous } = formatAuthorDisplay(
      row.author as AuthorLean,
      Boolean(row.useAnonymousDisplay)
    );
    return {
      id: String(row._id),
      body: row.body,
      imageUrl: row.imageUrl ?? null,
      visibilityScope: row.visibilityScope ?? "lga",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.author?._id != null ? String((row.author as { _id: Id })._id) : undefined,
        displayName,
        usedAnonymous,
      },
      likesCount: likes.length,
      commentsCount: commentCountByPost.get(String(row._id)) ?? 0,
      isLikedByCurrentUser: likes.some(
        (l) => l.user != null && String(l.user) === String(userId)
      ),
    };
  });

  return { posts, total, page, limit: safeLimit };
};

/** Public web feed: no auth, no location restriction. */
export const listPulsePostsPublic = async (page = 1, limit = 20) => {
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = Math.max(0, (page - 1) * safeLimit);

  const [rows, total] = await Promise.all([
    PulsePost.find({})
      .populate("author", "firstName lastName anonymousUsername")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    PulsePost.countDocuments({}),
  ]);

  const postIds = rows.map((r) => r._id);
  const commentCounts = await PulseComment.aggregate<{ _id: Id; count: number }>([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: "$post", count: { $sum: 1 } } },
  ]);
  const commentCountByPost = new Map(
    commentCounts.map((entry) => [String(entry._id), entry.count])
  );

  const posts = rows.map((row) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    const { displayName, usedAnonymous } = formatAuthorDisplay(
      row.author as AuthorLean,
      Boolean(row.useAnonymousDisplay)
    );
    return {
      id: String(row._id),
      body: row.body,
      imageUrl: row.imageUrl ?? null,
      visibilityScope: row.visibilityScope ?? "lga",
      audienceState: row.audienceState ?? null,
      audienceLga: row.audienceLga ?? null,
      audienceWard: row.audienceWard ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.author?._id != null ? String((row.author as { _id: Id })._id) : undefined,
        displayName,
        usedAnonymous,
      },
      likesCount: likes.length,
      commentsCount: commentCountByPost.get(String(row._id)) ?? 0,
      isLikedByCurrentUser: false,
    };
  });

  return { posts, total, page, limit: safeLimit };
};

export const createPulsePost = async (
  userId: Id,
  input: {
    body: string;
    visibilityScope?: VisibilityScope;
    useAnonymousDisplay?: boolean;
  },
  media?: { image?: MulterMemoryFile }
) => {
  const author = await ensureViewer(userId);
  const visibilityScope: VisibilityScope =
    input.visibilityScope === "ward" ? "ward" : "lga";
  const audienceLoc = assertPulseLocation(author, visibilityScope);

  const useAnonymous = Boolean(input.useAnonymousDisplay);
  if (useAnonymous && !author.anonymousUsername) {
    throw new Error("Set an anonymous username before posting anonymously");
  }

  const uploadedImageUrl = media?.image
    ? (
        await uploadFileToFirebase(
          media.image,
          `pulse/posts/${audienceLoc.state}/${audienceLoc.lga}`
        )
      ).publicUrl
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
  const likes = Array.isArray(populated?.likes) ? populated!.likes : [];
  const { displayName, usedAnonymous } = formatAuthorDisplay(
    populated?.author as AuthorLean,
    Boolean(populated?.useAnonymousDisplay)
  );
  return {
    id: String(populated!._id),
    body: populated!.body,
    imageUrl: populated!.imageUrl ?? null,
    visibilityScope: populated!.visibilityScope ?? "lga",
    createdAt: populated!.createdAt,
    updatedAt: populated!.updatedAt,
    author: {
      id:
        populated?.author?._id != null
          ? String((populated!.author as { _id: Id })._id)
          : undefined,
      displayName,
      usedAnonymous,
    },
    likesCount: likes.length,
    commentsCount: 0,
    isLikedByCurrentUser: likes.some((l) => String(l.user) === String(userId)),
  };
};

export const togglePulsePostLike = async (userId: Id, postId: string) => {
  await assertPostVisibleToUser(postId, userId);
  return togglePulsePostLikeCore(userId, postId);
};

/** Auth required, but no location restriction (web). */
export const togglePulsePostLikeAnyLocation = async (userId: Id, postId: string) => {
  const post = await PulsePost.findById(postId).lean();
  if (!post) throw new Error("Post not found");
  return togglePulsePostLikeCore(userId, postId);
};

const togglePulsePostLikeCore = async (userId: Id, postId: string) => {
  const post = await PulsePost.findById(postId);
  if (!post) throw new Error("Post not found");

  const likes = post.likes ?? [];
  const idx = likes.findIndex((l) => String(l.user) === String(userId));
  if (idx >= 0) likes.splice(idx, 1);
  else likes.push({ user: userId as never });
  post.likes = likes as never;
  await post.save();

  return {
    id: String(post._id),
    likesCount: likes.length,
    isLikedByCurrentUser: idx < 0,
  };
};

export const listPulsePostComments = async (userId: Id, postId: string) => {
  await assertPostVisibleToUser(postId, userId);
  const rows = await PulseComment.find({ post: postId })
    .populate("author", "firstName lastName anonymousUsername")
    .sort({ createdAt: -1 })
    .lean();
  return rows.map((row) => serializePulseComment(row, userId));
};

/** Public web comments: no auth, no location restriction. */
export const listPulsePostCommentsPublic = async (postId: string) => {
  const post = await PulsePost.findById(postId).lean();
  if (!post) throw new Error("Post not found");

  const rows = await PulseComment.find({ post: postId })
    .populate("author", "firstName lastName anonymousUsername")
    .sort({ createdAt: -1 })
    .lean();

  return rows.map((row) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    const { displayName, usedAnonymous } = formatAuthorDisplay(
      row.author as AuthorLean,
      Boolean(row.useAnonymousDisplay)
    );
    return {
      id: String(row._id),
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.author?._id != null ? String((row.author as { _id: Id })._id) : undefined,
        displayName,
        usedAnonymous,
      },
      likesCount: likes.length,
      isLikedByCurrentUser: false,
    };
  });
};

export const addPulsePostComment = async (
  userId: Id,
  postId: string,
  input: { body: string; useAnonymousDisplay?: boolean }
) => {
  const { post } = await assertPostVisibleToUser(postId, userId);
  return addPulsePostCommentCore(userId, postId, input, post.author);
};

/** Auth required; no location gate (for public web feed engagement). */
export const addPulsePostCommentAnyLocation = async (
  userId: Id,
  postId: string,
  input: { body: string; useAnonymousDisplay?: boolean }
) => {
  const post = await PulsePost.findById(postId).lean();
  if (!post) throw new Error("Post not found");
  return addPulsePostCommentCore(userId, postId, input, post.author);
};

const addPulsePostCommentCore = async (
  userId: Id,
  postId: string,
  input: { body: string; useAnonymousDisplay?: boolean },
  postAuthor: unknown
) => {
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

  if (postAuthor && String(postAuthor) !== String(userId)) {
    await dispatchNotificationToUsers({
      type: "discussion-reply",
      preferenceKey: "discussionReplies",
      body: "Someone replied to your pulse post.",
      info: String(input.body).slice(0, 120),
      userIds: [String(postAuthor)],
    });
  }

  return serializePulseComment(populated!, userId);
};


export const togglePulseCommentLike = async (
  userId: Id,
  postId: string,
  commentId: string
) => {
  await assertPostVisibleToUser(postId, userId);
  return togglePulseCommentLikeCore(userId, postId, commentId);
};

/** Auth required; no location gate (for public web feed engagement). */
export const togglePulseCommentLikeAnyLocation = async (
  userId: Id,
  postId: string,
  commentId: string
) => {
  const post = await PulsePost.exists({ _id: postId });
  if (!post) throw new Error("Post not found");
  return togglePulseCommentLikeCore(userId, postId, commentId);
};

const togglePulseCommentLikeCore = async (
  userId: Id,
  postId: string,
  commentId: string
) => {
  const comment = await PulseComment.findOne({ _id: commentId, post: postId });
  if (!comment) throw new Error("Comment not found");

  const likes = comment.likes ?? [];
  const idx = likes.findIndex((l) => String(l.user) === String(userId));
  if (idx >= 0) likes.splice(idx, 1);
  else likes.push({ user: userId as never });
  comment.likes = likes as never;
  await comment.save();

  const populated = await PulseComment.findById(comment._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();
  return serializePulseComment(populated!, userId);
};

