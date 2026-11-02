/**
 * Pulse report + block handlers, shared by the web and mobile Pulse routers.
 * Routes using these must run authMiddleware first.
 */
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";
import { invalidateCacheByPrefixes } from "../../utils/cache.ts";
import {
  blockPulseAuthor,
  listPulseBlocks,
  reportPulseComment,
  reportPulsePost,
  unblockPulseBlock,
} from "../../services/mobile/pulseModerationService.ts";

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

const requireUserId = (req: Request): string => {
  const id = (req as AuthenticatedRequest).user?._id;
  if (id == null) throw new Error("Authentication required");
  return String(id);
};

const invalidateReadCaches = async (userId: string): Promise<void> => {
  await invalidateCacheByPrefixes([
    `mobile:elections:${userId}:`,
    `mobile:dashboard:${userId}:`,
  ]);
};

const statusFor = (message: string): number => {
  if (message.includes("Authentication required")) return 401;
  if (message.includes("already reported")) return 409;
  if (message.includes("not found")) return 404;
  if (
    message.includes("reason") ||
    message.includes("details must") ||
    message.includes("Send postId") ||
    message.includes("You can't")
  ) {
    return 400;
  }
  return 500;
};

const sendError = (res: Response, error: unknown) => {
  const message = errMsg(error);
  return res.status(statusFor(message)).json({ message });
};

/** POST /posts/:postId/report — { reason, details? } */
export const postPulsePostReport = async (req: Request, res: Response) => {
  try {
    const postId = asParamString(req.params.postId);
    if (!isValidObjectId(postId)) return res.status(400).json({ message: "Invalid post id" });
    const userId = requireUserId(req);
    const b = (req.body ?? {}) as Record<string, unknown>;
    const report = await reportPulsePost(userId, postId, {
      reason: b.reason,
      details: b.details,
    });
    await invalidateReadCaches(userId);
    return res.status(201).json({ report });
  } catch (error) {
    return sendError(res, error);
  }
};

/** POST /posts/:postId/comments/:commentId/report — { reason, details? } */
export const postPulseCommentReport = async (req: Request, res: Response) => {
  try {
    const postId = asParamString(req.params.postId);
    const commentId = asParamString(req.params.commentId);
    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const userId = requireUserId(req);
    const b = (req.body ?? {}) as Record<string, unknown>;
    const report = await reportPulseComment(userId, postId, commentId, {
      reason: b.reason,
      details: b.details,
    });
    await invalidateReadCaches(userId);
    return res.status(201).json({ report });
  } catch (error) {
    return sendError(res, error);
  }
};

/** POST /blocks — { postId } or { commentId }: blocks that content's author. */
export const postPulseBlock = async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req);
    const b = (req.body ?? {}) as Record<string, unknown>;
    const block = await blockPulseAuthor(userId, { postId: b.postId, commentId: b.commentId });
    await invalidateReadCaches(userId);
    return res.status(200).json({ block });
  } catch (error) {
    return sendError(res, error);
  }
};

/** DELETE /blocks/:blockId */
export const deletePulseBlock = async (req: Request, res: Response) => {
  try {
    const blockId = asParamString(req.params.blockId);
    if (!isValidObjectId(blockId)) return res.status(400).json({ message: "Invalid block id" });
    const userId = requireUserId(req);
    const data = await unblockPulseBlock(userId, blockId);
    await invalidateReadCaches(userId);
    return res.status(200).json(data);
  } catch (error) {
    return sendError(res, error);
  }
};

/** GET /blocks */
export const getPulseBlocks = async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req);
    const blocks = await listPulseBlocks(userId);
    return res.status(200).json({ blocks });
  } catch (error) {
    return sendError(res, error);
  }
};
