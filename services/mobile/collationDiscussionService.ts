import type { Types } from "mongoose";
import CollationReportComment from "../../models/Election/CollationReportComment.ts";
import CollationDiscussionPost from "../../models/Election/CollationDiscussionPost.ts";
import CollationDiscussionComment from "../../models/Election/CollationDiscussionComment.ts";
import ElectionData from "../../models/Election/ElectionData.ts";
import IncidentReport from "../../models/Election/IncidentReport.ts";
import CompletedUser from "../../models/CompletedUser.ts";
import { assertMobileCollationAccess } from "./collationBundleService.ts";
import { observerSubmissionDocMatchesLocationFilter } from "../Election/electionLive.ts";
import { uploadFileToFirebase } from "../../config/firebaseUploader.ts";
import { dispatchNotificationToUsers } from "./notificationDispatchService.ts";

type Id = Types.ObjectId | string;
type VisibilityScope = "ward" | "lga";

type AuthorLean = {
  _id?: Id;
  firstName?: string | null;
  lastName?: string | null;
  anonymousUsername?: string | null;
};

type MulterMemoryFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

const uploadDiscussionMedia = async (
  files: MulterMemoryFile[] | undefined,
  folder: string
): Promise<string[]> => {
  if (!files || files.length === 0) return [];
  const uploads = await Promise.all(
    files.map((file) => uploadFileToFirebase(file, folder))
  );
  return uploads.map((u) => u.publicUrl);
};

const normalizeLocationKey = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const assertUserPulseLocation = (
  user: {
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
  },
  visibilityScope: VisibilityScope
) => {
  const state = normalizeLocationKey(user.state);
  const lga = normalizeLocationKey(user.lga);
  const ward = normalizeLocationKey(user.ward);
  if (!state || !lga) {
    throw new Error("Complete your state and LGA in profile to use Pulse");
  }
  if (visibilityScope === "ward" && !ward) {
    throw new Error("Complete your ward in profile to post to ward Pulse");
  }
  return { state, lga, ward };
};

export const formatCollationAuthorDisplay = (
  author: AuthorLean | null | undefined,
  useAnonymousDisplay: boolean
): { displayName: string; usedAnonymous: boolean } => {
  if (!author) {
    return { displayName: "Member", usedAnonymous: false };
  }
  if (useAnonymousDisplay && author.anonymousUsername) {
    return {
      displayName: `@${author.anonymousUsername}`,
      usedAnonymous: true,
    };
  }
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
  return { displayName: name || "Member", usedAnonymous: false };
};

const loadTargetForThread = async (
  activeElectionId: string,
  targetType: "election_result" | "incident_report",
  targetId: string
) => {
  if (targetType === "election_result") {
    const doc = await ElectionData.findById(targetId).lean();
    return { doc, kind: "election_result" as const };
  }
  const doc = await IncidentReport.findById(targetId).lean();
  return { doc, kind: "incident_report" as const };
};

const assertTargetInCollationScope = async (
  activeElectionId: string,
  userId: Id,
  targetType: "election_result" | "incident_report",
  targetId: string
) => {
  const { user, electionType } = await assertMobileCollationAccess(activeElectionId, userId);
  const { doc } = await loadTargetForThread(activeElectionId, targetType, targetId);
  if (!doc || String(doc.election) !== String(activeElectionId)) {
    throw new Error("Report not found for this election");
  }
  if (!observerSubmissionDocMatchesLocationFilter(doc, electionType, user)) {
    throw new Error("You cannot participate in discussions for this report from your location");
  }
  return { user, electionType, doc };
};

const serializeReportComment = (
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
  const likeCount = likes.length;
  const liked = likes.some((l) => l.user != null && String(l.user) === String(viewerUserId));
  const { displayName, usedAnonymous } = formatCollationAuthorDisplay(
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
    likesCount: likeCount,
    isLikedByCurrentUser: liked,
  };
};

export const listReportThreadComments = async (
  activeElectionId: string,
  userId: Id,
  targetType: "election_result" | "incident_report",
  targetId: string
) => {
  await assertTargetInCollationScope(activeElectionId, userId, targetType, targetId);

  const rows = await CollationReportComment.find({
    activeElection: activeElectionId,
    targetType,
    targetId,
  })
    .populate("author", "firstName lastName anonymousUsername")
    .sort({ createdAt: -1 })
    .lean();

  return rows.map((r) => serializeReportComment(r, userId));
};

export const addReportThreadComment = async (
  activeElectionId: string,
  userId: Id,
  input: {
    targetType: "election_result" | "incident_report";
    targetId: string;
    body: string;
    useAnonymousDisplay?: boolean;
  }
) => {
  await assertTargetInCollationScope(activeElectionId, userId, input.targetType, input.targetId);

  const author = await CompletedUser.findById(userId).lean();
  if (!author) throw new Error("User not found");

  const useAnonymous = Boolean(input.useAnonymousDisplay);
  if (useAnonymous && !author.anonymousUsername) {
    throw new Error("Set an anonymous username before commenting anonymously");
  }

  const created = await CollationReportComment.create({
    activeElection: activeElectionId,
    targetType: input.targetType,
    targetId: input.targetId,
    author: userId,
    body: input.body.trim(),
    useAnonymousDisplay: useAnonymous,
    likes: [],
  });

  const populated = await CollationReportComment.findById(created._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();

  const targetOwnerId = (await loadTargetForThread(
    activeElectionId,
    input.targetType,
    input.targetId
  )).doc?.user;
  if (targetOwnerId && String(targetOwnerId) !== String(userId)) {
    await dispatchNotificationToUsers({
      type: "discussion-reply",
      preferenceKey: "discussionReplies",
      body: "New comment on your report thread.",
      info: String(input.body).slice(0, 120),
      userIds: [String(targetOwnerId)],
    });
  }

  return serializeReportComment(populated!, userId);
};

export const toggleReportCommentLike = async (
  activeElectionId: string,
  userId: Id,
  commentId: string
) => {
  const commentMeta = await CollationReportComment.findOne({
    _id: commentId,
    activeElection: activeElectionId,
  }).lean();
  if (!commentMeta) throw new Error("Comment not found");
  await assertTargetInCollationScope(
    activeElectionId,
    userId,
    commentMeta.targetType as "election_result" | "incident_report",
    String(commentMeta.targetId)
  );

  const comment = await CollationReportComment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  const likes = comment.likes ?? [];
  const idx = likes.findIndex((l) => String(l.user) === String(userId));
  if (idx >= 0) {
    likes.splice(idx, 1);
  } else {
    likes.push({ user: userId as never });
  }
  comment.likes = likes as never;
  await comment.save();

  const populated = await CollationReportComment.findById(comment._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();
  return serializeReportComment(populated!, userId);
};

export const listDiscussionPosts = async (
  activeElectionId: string,
  userId: Id,
  page = 1,
  limit = 20
) => {
  const { user } = await assertMobileCollationAccess(activeElectionId, userId);
  const skip = Math.max(0, (page - 1) * limit);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const viewerLoc = assertUserPulseLocation(user, "lga");
  const visibilityFilter = {
    activeElection: activeElectionId,
    $or: [
      {
        visibilityScope: "lga",
        audienceState: viewerLoc.state,
        audienceLga: viewerLoc.lga,
      },
      {
        visibilityScope: "ward",
        audienceState: viewerLoc.state,
        audienceLga: viewerLoc.lga,
        audienceWard: viewerLoc.ward,
      },
    ],
  };

  const [rows, total] = await Promise.all([
    CollationDiscussionPost.find(visibilityFilter)
      .populate("author", "firstName lastName anonymousUsername")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    CollationDiscussionPost.countDocuments(visibilityFilter),
  ]);

  const mapped = rows.map((row) => {
    const likes = Array.isArray(row.likes) ? row.likes : [];
    const { displayName, usedAnonymous } = formatCollationAuthorDisplay(
      row.author as AuthorLean,
      Boolean(row.useAnonymousDisplay)
    );
    return {
      id: String(row._id),
      body: row.body,
      imageUrls: row.imageUrls ?? [],
      videoUrls: row.videoUrls ?? [],
      visibilityScope: row.visibilityScope ?? "lga",
      allowSocialShare: row.allowSocialShare ?? false,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.author?._id != null ? String((row.author as { _id: Id })._id) : undefined,
        displayName,
        usedAnonymous,
      },
      likesCount: likes.length,
      isLikedByCurrentUser: likes.some((l) => l.user != null && String(l.user) === String(userId)),
    };
  });

  return { posts: mapped, total, page, limit: safeLimit };
};

export const createDiscussionPost = async (
  activeElectionId: string,
  userId: Id,
  input: {
    body: string;
    imageUrls?: string[];
    videoUrls?: string[];
    visibilityScope?: VisibilityScope;
    allowSocialShare?: boolean;
    useAnonymousDisplay?: boolean;
  },
  media?: {
    images?: MulterMemoryFile[];
    videos?: MulterMemoryFile[];
  }
) => {
  await assertMobileCollationAccess(activeElectionId, userId);

  const author = await CompletedUser.findById(userId).lean();
  if (!author) throw new Error("User not found");
  const visibilityScope: VisibilityScope =
    input.visibilityScope === "ward" ? "ward" : "lga";
  const audienceLoc = assertUserPulseLocation(author, visibilityScope);
  const useAnonymous = Boolean(input.useAnonymousDisplay);
  if (useAnonymous && !author.anonymousUsername) {
    throw new Error("Set an anonymous username before posting anonymously");
  }

  const uploadedImageUrls = await uploadDiscussionMedia(
    media?.images?.slice(0, 6),
    `collation/discussion/${activeElectionId}/images`
  );
  const uploadedVideoUrls = await uploadDiscussionMedia(
    media?.videos?.slice(0, 3),
    `collation/discussion/${activeElectionId}/videos`
  );

  const created = await CollationDiscussionPost.create({
    activeElection: activeElectionId,
    author: userId,
    body: input.body.trim(),
    imageUrls: [
      ...(input.imageUrls?.filter(Boolean).slice(0, 6) ?? []),
      ...uploadedImageUrls,
    ].slice(0, 6),
    videoUrls: [
      ...(input.videoUrls?.filter(Boolean).slice(0, 3) ?? []),
      ...uploadedVideoUrls,
    ].slice(0, 3),
    visibilityScope,
    audienceState: audienceLoc.state,
    audienceLga: audienceLoc.lga,
    audienceWard: visibilityScope === "ward" ? audienceLoc.ward : undefined,
    allowSocialShare: Boolean(input.allowSocialShare),
    useAnonymousDisplay: useAnonymous,
    likes: [],
  });

  const populated = await CollationDiscussionPost.findById(created._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();
  const row = populated!;
  const likes = Array.isArray(row.likes) ? row.likes : [];
  const { displayName, usedAnonymous } = formatCollationAuthorDisplay(
    row.author as AuthorLean,
    Boolean(row.useAnonymousDisplay)
  );
  return {
    id: String(row._id),
    body: row.body,
    imageUrls: row.imageUrls ?? [],
    videoUrls: row.videoUrls ?? [],
    visibilityScope: row.visibilityScope ?? "lga",
    allowSocialShare: row.allowSocialShare ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author: {
      id: row.author?._id != null ? String((row.author as { _id: Id })._id) : undefined,
      displayName,
      usedAnonymous,
    },
    likesCount: likes.length,
    isLikedByCurrentUser: likes.some((l) => l.user != null && String(l.user) === String(userId)),
  };
};

export const toggleDiscussionPostLike = async (
  activeElectionId: string,
  userId: Id,
  postId: string
) => {
  await assertMobileCollationAccess(activeElectionId, userId);
  const post = await CollationDiscussionPost.findOne({
    _id: postId,
    activeElection: activeElectionId,
  });
  if (!post) throw new Error("Post not found");

  const likes = post.likes ?? [];
  const idx = likes.findIndex((l) => String(l.user) === String(userId));
  if (idx >= 0) likes.splice(idx, 1);
  else likes.push({ user: userId as never });
  post.likes = likes as never;
  await post.save();

  const populated = await CollationDiscussionPost.findById(post._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();

  const likesArr = Array.isArray(populated?.likes) ? populated!.likes : [];
  const { displayName, usedAnonymous } = formatCollationAuthorDisplay(
    populated?.author as AuthorLean,
    Boolean(populated?.useAnonymousDisplay)
  );
  return {
    id: String(populated!._id),
    likesCount: likesArr.length,
    isLikedByCurrentUser: likesArr.some((l) => String(l.user) === String(userId)),
    author: {
      id: populated?.author?._id != null ? String((populated!.author as { _id: Id })._id) : undefined,
      displayName,
      usedAnonymous,
    },
  };
};

const assertPostBelongsToElection = async (
  activeElectionId: string,
  postId: string
) => {
  const post = await CollationDiscussionPost.findOne({
    _id: postId,
    activeElection: activeElectionId,
  }).lean();
  if (!post) throw new Error("Post not found");
  return post;
};

export const listPostComments = async (
  activeElectionId: string,
  userId: Id,
  postId: string
) => {
  await assertMobileCollationAccess(activeElectionId, userId);
  await assertPostBelongsToElection(activeElectionId, postId);

  const rows = await CollationDiscussionComment.find({ post: postId })
    .populate("author", "firstName lastName anonymousUsername")
    .sort({ createdAt: -1 })
    .lean();

  return rows.map((r) => serializeReportComment(r, userId));
};

export const addPostComment = async (
  activeElectionId: string,
  userId: Id,
  postId: string,
  input: { body: string; useAnonymousDisplay?: boolean }
) => {
  await assertMobileCollationAccess(activeElectionId, userId);
  const post = await assertPostBelongsToElection(activeElectionId, postId);

  const author = await CompletedUser.findById(userId).lean();
  if (!author) throw new Error("User not found");
  const useAnonymous = Boolean(input.useAnonymousDisplay);
  if (useAnonymous && !author.anonymousUsername) {
    throw new Error("Set an anonymous username before commenting anonymously");
  }

  const created = await CollationDiscussionComment.create({
    post: postId,
    author: userId,
    body: input.body.trim(),
    useAnonymousDisplay: useAnonymous,
    likes: [],
  });

  const populated = await CollationDiscussionComment.findById(created._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();

  if (post.author && String(post.author) !== String(userId)) {
    await dispatchNotificationToUsers({
      type: "discussion-reply",
      preferenceKey: "discussionReplies",
      body: "Someone replied to your discussion post.",
      info: String(input.body).slice(0, 120),
      userIds: [String(post.author)],
    });
  }

  return serializeReportComment(populated!, userId);
};

export const togglePostCommentLike = async (
  activeElectionId: string,
  userId: Id,
  postId: string,
  commentId: string
) => {
  await assertMobileCollationAccess(activeElectionId, userId);
  await assertPostBelongsToElection(activeElectionId, postId);

  const comment = await CollationDiscussionComment.findOne({
    _id: commentId,
    post: postId,
  });
  if (!comment) throw new Error("Comment not found");

  const likes = comment.likes ?? [];
  const idx = likes.findIndex((l) => String(l.user) === String(userId));
  if (idx >= 0) likes.splice(idx, 1);
  else likes.push({ user: userId as never });
  comment.likes = likes as never;
  await comment.save();

  const populated = await CollationDiscussionComment.findById(comment._id)
    .populate("author", "firstName lastName anonymousUsername")
    .lean();
  return serializeReportComment(populated!, userId);
};
