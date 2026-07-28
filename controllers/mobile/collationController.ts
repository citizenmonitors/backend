import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";
import {
  getMobileCollationBundle,
} from "../../services/mobile/collationBundleService.ts";
import {
  addPostComment,
  addReportThreadComment,
  createDiscussionPost,
  listDiscussionPosts,
  listPostComments,
  listReportThreadComments,
  toggleDiscussionPostLike,
  togglePostCommentLike,
  toggleReportCommentLike,
} from "../../services/mobile/collationDiscussionService.ts";
import { invalidateCacheByPrefixes } from "../../utils/cache.ts";

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

const requireUserId = (req: AuthenticatedRequest): string => {
  const id = req.user?._id;
  if (id == null) throw new Error("Authentication required");
  return String(id);
};

const invalidateMobileReadCaches = async (userId: string): Promise<void> => {
  await invalidateCacheByPrefixes([`mobile:elections:${userId}:`, `mobile:dashboard:${userId}:`]);
};

const toBooleanIfBooleanLike = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    if (lowered === "true") return true;
    if (lowered === "false") return false;
  }
  return Boolean(value);
};

const parseTargetType = (
  raw: string
): "election_result" | "incident_report" | null => {
  if (raw === "election-result") return "election_result";
  if (raw === "incident-report") return "incident_report";
  return null;
};

export const getMobileCollation = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const activeElectionId = asParamString(req.params.activeElectionId);
    if (!isValidObjectId(activeElectionId)) {
      return res.status(400).json({ message: "Invalid election id" });
    }
    const userId = requireUserId(r);
    const data = await getMobileCollationBundle(activeElectionId, userId);
    return res.status(200).json(data);
  } catch (error) {
    const message = errMsg(error);
    if (message.includes("not available for your location")) {
      return res.status(403).json({ message });
    }
    if (
      message === "Election not found" ||
      message === "User not found" ||
      message === "Active Election not found"
    ) {
      return res.status(404).json({ message });
    }
    return res.status(500).json({ message });
  }
};

export const getReportThreadCommentsMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
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
  } catch (error) {
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

export const postReportThreadCommentMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
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
    const body = String((req.body as { body?: unknown })?.body ?? "").trim();
    const useAnonymousDisplay = toBooleanIfBooleanLike(
      (req.body as { useAnonymousDisplay?: unknown })?.useAnonymousDisplay
    );
    if (!body) {
      return res.status(400).json({ message: "body is required" });
    }
    const comment = await addReportThreadComment(activeElectionId, userId, {
      targetType,
      targetId,
      body,
      useAnonymousDisplay,
    });
    await invalidateMobileReadCaches(userId);
    return res.status(201).json({ comment });
  } catch (error) {
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

export const postReportCommentLikeMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const activeElectionId = asParamString(req.params.activeElectionId);
    const commentId = asParamString(req.params.commentId);
    if (!isValidObjectId(activeElectionId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const userId = requireUserId(r);
    const comment = await toggleReportCommentLike(activeElectionId, userId, commentId);
    await invalidateMobileReadCaches(userId);
    return res.status(200).json({ comment });
  } catch (error) {
    return res.status(400).json({ message: errMsg(error) });
  }
};

export const getDiscussionPostsMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const activeElectionId = asParamString(req.params.activeElectionId);
    if (!isValidObjectId(activeElectionId)) {
      return res.status(400).json({ message: "Invalid election id" });
    }
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
    const userId = requireUserId(r);
    const data = await listDiscussionPosts(activeElectionId, userId, page, limit);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ message: errMsg(error) });
  }
};

export const postDiscussionPostMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const activeElectionId = asParamString(req.params.activeElectionId);
    if (!isValidObjectId(activeElectionId)) {
      return res.status(400).json({ message: "Invalid election id" });
    }
    const userId = requireUserId(r);
    const b = req.body as {
      body?: unknown;
      imageUrls?: unknown;
      videoUrls?: unknown;
      allowSocialShare?: unknown;
      useAnonymousDisplay?: unknown;
    };
    const body = String(b.body ?? "").trim();
    if (!body) return res.status(400).json({ message: "body is required" });
    const post = await createDiscussionPost(activeElectionId, userId, {
      body,
      imageUrls: Array.isArray(b.imageUrls) ? b.imageUrls.map(String) : undefined,
      videoUrls: Array.isArray(b.videoUrls) ? b.videoUrls.map(String) : undefined,
      allowSocialShare: toBooleanIfBooleanLike(b.allowSocialShare),
      useAnonymousDisplay: toBooleanIfBooleanLike(b.useAnonymousDisplay),
    }, {
      images: ((r.files as Record<string, unknown> | undefined)?.["images[]"] as
        | { buffer: Buffer; mimetype: string; originalname: string }[]
        | undefined),
      videos: ((r.files as Record<string, unknown> | undefined)?.["videos[]"] as
        | { buffer: Buffer; mimetype: string; originalname: string }[]
        | undefined),
    });
    await invalidateMobileReadCaches(userId);
    return res.status(201).json({ post });
  } catch (error) {
    return res.status(400).json({ message: errMsg(error) });
  }
};

export const postDiscussionPostLikeMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const activeElectionId = asParamString(req.params.activeElectionId);
    const postId = asParamString(req.params.postId);
    if (!isValidObjectId(activeElectionId) || !isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const userId = requireUserId(r);
    const data = await toggleDiscussionPostLike(activeElectionId, userId, postId);
    await invalidateMobileReadCaches(userId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ message: errMsg(error) });
  }
};

export const getDiscussionPostCommentsMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const activeElectionId = asParamString(req.params.activeElectionId);
    const postId = asParamString(req.params.postId);
    if (!isValidObjectId(activeElectionId) || !isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const userId = requireUserId(r);
    const comments = await listPostComments(activeElectionId, userId, postId);
    return res.status(200).json({ comments });
  } catch (error) {
    return res.status(400).json({ message: errMsg(error) });
  }
};

export const postDiscussionPostCommentMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const activeElectionId = asParamString(req.params.activeElectionId);
    const postId = asParamString(req.params.postId);
    if (!isValidObjectId(activeElectionId) || !isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const userId = requireUserId(r);
    const body = String((req.body as { body?: unknown })?.body ?? "").trim();
    const useAnonymousDisplay = toBooleanIfBooleanLike(
      (req.body as { useAnonymousDisplay?: unknown })?.useAnonymousDisplay
    );
    if (!body) return res.status(400).json({ message: "body is required" });
    const comment = await addPostComment(activeElectionId, userId, postId, {
      body,
      useAnonymousDisplay,
    });
    await invalidateMobileReadCaches(userId);
    return res.status(201).json({ comment });
  } catch (error) {
    return res.status(400).json({ message: errMsg(error) });
  }
};

export const postDiscussionPostCommentLikeMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const activeElectionId = asParamString(req.params.activeElectionId);
    const postId = asParamString(req.params.postId);
    const commentId = asParamString(req.params.commentId);
    if (
      !isValidObjectId(activeElectionId) ||
      !isValidObjectId(postId) ||
      !isValidObjectId(commentId)
    ) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const userId = requireUserId(r);
    const comment = await togglePostCommentLike(
      activeElectionId,
      userId,
      postId,
      commentId
    );
    await invalidateMobileReadCaches(userId);
    return res.status(200).json({ comment });
  } catch (error) {
    return res.status(400).json({ message: errMsg(error) });
  }
};
