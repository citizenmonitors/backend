/**
 * Pulse safety: reporting posts/comments, blocking users, and admin review of reports.
 * Feed/comment filtering for blocks and reports lives in pulseService.ts.
 */
import mongoose, { type Types } from "mongoose";
import PulsePost from "../../models/Pulse/PulsePost.ts";
import PulseComment from "../../models/Pulse/PulseComment.ts";
import PulseReport, {
  PULSE_REPORT_REASONS,
  PULSE_REPORT_STATUSES,
  type PulseReportReason,
  type PulseReportStatus,
} from "../../models/Pulse/PulseReport.ts";
import UserBlock from "../../models/Pulse/UserBlock.ts";
import { isValidObjectId } from "../../utils/validators.ts";
import { deletePulsePostCore, formatAuthorDisplay } from "./pulseService.ts";

type Id = Types.ObjectId | string;

const isDuplicateKey = (error: unknown) =>
  typeof error === "object" &&
  error != null &&
  "code" in error &&
  (error as { code?: number }).code === 11000;

const parseReason = (value: unknown): PulseReportReason => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) throw new Error(`reason is required. Use ${PULSE_REPORT_REASONS.join(", ")}`);
  if (!(PULSE_REPORT_REASONS as readonly string[]).includes(raw)) {
    throw new Error(`Invalid report reason. Use ${PULSE_REPORT_REASONS.join(", ")}`);
  }
  return raw as PulseReportReason;
};

const parseDetails = (value: unknown): string | undefined => {
  const details = String(value ?? "").trim();
  if (!details) return undefined;
  if (details.length > 1000) throw new Error("details must be 1000 characters or fewer");
  return details;
};

const serializeReportForReporter = (row: {
  _id: Id;
  targetType: string;
  reason: string;
  status: string;
  createdAt?: Date;
}) => ({
  id: String(row._id),
  targetType: row.targetType,
  reason: row.reason,
  status: row.status,
  createdAt: row.createdAt,
});

/* ------------------------------ Reports ------------------------------ */

/**
 * Reporting a plain repost reports the original, since that's whose content it is.
 * A quote is the quoter's own text, so reporting a quote reports the quote.
 */
export const reportPulsePost = async (
  userId: Id,
  postId: string,
  input: { reason?: unknown; details?: unknown }
) => {
  const reason = parseReason(input.reason);
  const details = parseDetails(input.details);

  const source = await PulsePost.findById(postId).lean();
  if (!source) throw new Error("Post not found");
  const target =
    (source.repostedFrom &&
      !source.isQuote &&
      (await PulsePost.findById(source.repostedFrom).lean())) ||
    source;

  if (String(target.author) === String(userId)) {
    throw new Error("You can't report your own post");
  }

  try {
    const report = await PulseReport.create({
      reporter: userId,
      targetType: "post",
      post: target._id,
      comment: null,
      reportedUser: target.author,
      reason,
      details,
      snapshot: { body: target.body, imageUrl: target.imageUrl },
    });
    return serializeReportForReporter(report.toObject());
  } catch (error) {
    if (isDuplicateKey(error)) throw new Error("You already reported this post");
    throw error;
  }
};

export const reportPulseComment = async (
  userId: Id,
  postId: string,
  commentId: string,
  input: { reason?: unknown; details?: unknown }
) => {
  const reason = parseReason(input.reason);
  const details = parseDetails(input.details);

  const comment = await PulseComment.findOne({ _id: commentId, post: postId }).lean();
  if (!comment) throw new Error("Comment not found");
  if (String(comment.author) === String(userId)) {
    throw new Error("You can't report your own comment");
  }

  try {
    const report = await PulseReport.create({
      reporter: userId,
      targetType: "comment",
      post: comment.post,
      comment: comment._id,
      reportedUser: comment.author,
      reason,
      details,
      snapshot: { body: comment.body },
    });
    return serializeReportForReporter(report.toObject());
  } catch (error) {
    if (isDuplicateKey(error)) throw new Error("You already reported this comment");
    throw error;
  }
};

/* ------------------------------ Blocking ----------------------------- */

type AuthorLean = {
  _id?: Id;
  firstName?: string | null;
  lastName?: string | null;
  anonymousUsername?: string | null;
};

/**
 * Resolve who to block from a post or comment, plus the name the blocker saw on it.
 * Clients never get the account id behind an anonymous name, so blocks are made by content.
 */
const resolveBlockTarget = async (input: {
  postId?: unknown;
  commentId?: unknown;
}): Promise<{ userId: string; displayName: string }> => {
  const commentId = String(input.commentId ?? "").trim();
  const postId = String(input.postId ?? "").trim();
  if (!commentId && !postId) throw new Error("Send postId or commentId to block its author");

  const row = commentId
    ? isValidObjectId(commentId)
      ? await PulseComment.findById(commentId)
          .populate<{ author: AuthorLean | null }>("author", "firstName lastName anonymousUsername profileImage.url")
          .lean()
      : null
    : isValidObjectId(postId)
      ? await PulsePost.findById(postId)
          .populate<{ author: AuthorLean | null }>("author", "firstName lastName anonymousUsername profileImage.url")
          .lean()
      : null;
  if (!row) throw new Error(commentId ? "Comment not found" : "Post not found");
  if (!row.author?._id) throw new Error("User not found");

  return {
    userId: String(row.author._id),
    displayName: formatAuthorDisplay(row.author, Boolean(row.useAnonymousDisplay)).displayName,
  };
};

const serializeBlock = (row: { _id: Id; displayName?: string | null; createdAt?: Date }) => ({
  id: String(row._id),
  displayName: row.displayName || "Member",
  blockedAt: row.createdAt,
});

/** Block the author of a post or comment. Idempotent. */
export const blockPulseAuthor = async (
  userId: Id,
  input: { postId?: unknown; commentId?: unknown }
) => {
  const target = await resolveBlockTarget(input);
  if (target.userId === String(userId)) throw new Error("You can't block yourself");

  try {
    await UserBlock.updateOne(
      { blocker: userId, blocked: target.userId },
      { $setOnInsert: { displayName: target.displayName } },
      { upsert: true }
    );
  } catch (error) {
    // Two taps at once can race on the upsert; the block exists either way.
    if (!isDuplicateKey(error)) throw error;
  }
  const row = await UserBlock.findOne({ blocker: userId, blocked: target.userId }).lean();
  if (!row) throw new Error("Block could not be saved");
  // Echo the name from THIS content, not the stored one: if the user was already blocked
  // under another name, returning that name would link the two identities.
  return serializeBlock({ ...row, displayName: target.displayName });
};

/** Only the blocker can remove their block. Idempotent: an unknown id is treated as done. */
export const unblockPulseBlock = async (userId: Id, blockId: string) => {
  await UserBlock.deleteOne({ _id: blockId, blocker: userId });
  return { id: blockId, blocked: false };
};

/** The blocker's list. Shows the name they saw, never the account id. */
export const listPulseBlocks = async (userId: Id) => {
  const rows = await UserBlock.find({ blocker: userId }).sort({ createdAt: -1 }).lean();
  return rows.map(serializeBlock);
};

/* ---------------------------- Admin review --------------------------- */

const parseStatusFilter = (value: unknown): PulseReportStatus | "all" => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "open";
  if (raw === "all") return "all";
  if ((PULSE_REPORT_STATUSES as readonly string[]).includes(raw)) {
    return raw as PulseReportStatus;
  }
  throw new Error(`Invalid status. Use all, ${PULSE_REPORT_STATUSES.join(", ")}`);
};

type UserLean = {
  _id?: Id;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  anonymousUsername?: string | null;
};

const serializeAdminUser = (user: UserLean | null | undefined) =>
  user
    ? {
        id: String(user._id),
        name: [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || null,
        email: user.email ?? null,
        anonymousUsername: user.anonymousUsername ?? null,
      }
    : null;

const targetKey = (post: unknown, comment: unknown) => `${String(post)}:${String(comment ?? "")}`;

export const listPulseReportsAdmin = async (input: {
  status?: unknown;
  page?: number;
  limit?: number;
}) => {
  const status = parseStatusFilter(input.status);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));
  const page = Math.max(1, input.page ?? 1);
  const filter = status === "all" ? {} : { status };

  const [rows, total] = await Promise.all([
    PulseReport.find(filter)
      .populate<{ reporter: UserLean | null }>("reporter", "firstName lastName email")
      .populate<{ reportedUser: UserLean | null }>(
        "reportedUser",
        "firstName lastName email anonymousUsername"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PulseReport.countDocuments(filter),
  ]);

  const postIds = [...new Set(rows.map((r) => String(r.post)))];
  const commentIds = rows.filter((r) => r.comment).map((r) => String(r.comment));
  const [livePosts, liveComments, openCounts] = await Promise.all([
    PulsePost.distinct("_id", { _id: { $in: postIds } }),
    PulseComment.distinct("_id", { _id: { $in: commentIds } }),
    PulseReport.aggregate<{ _id: { post: Id; comment: Id | null }; count: number }>([
      {
        $match: {
          status: "open",
          post: { $in: postIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      },
      { $group: { _id: { post: "$post", comment: "$comment" }, count: { $sum: 1 } } },
    ]),
  ]);
  const livePostSet = new Set(livePosts.map(String));
  const liveCommentSet = new Set(liveComments.map(String));
  const openByTarget = new Map(
    openCounts.map((c) => [targetKey(c._id.post, c._id.comment), c.count])
  );

  return {
    reports: rows.map((row) => ({
      id: String(row._id),
      targetType: row.targetType,
      postId: String(row.post),
      commentId: row.comment ? String(row.comment) : null,
      reason: row.reason,
      details: row.details ?? null,
      snapshot: { body: row.snapshot?.body ?? null, imageUrl: row.snapshot?.imageUrl ?? null },
      contentExists:
        row.targetType === "comment"
          ? liveCommentSet.has(String(row.comment))
          : livePostSet.has(String(row.post)),
      openReportsOnContent: openByTarget.get(targetKey(row.post, row.comment)) ?? 0,
      status: row.status,
      reporter: serializeAdminUser(row.reporter),
      reportedUser: serializeAdminUser(row.reportedUser),
      adminNote: row.adminNote ?? null,
      reviewedAt: row.reviewedAt ?? null,
      createdAt: row.createdAt,
    })),
    total,
    page,
    limit,
    status,
  };
};

/**
 * "remove" deletes the reported post (with its reposts and comments) or comment.
 * Either action closes every open report on the same content.
 */
export const resolvePulseReportAdmin = async (
  adminId: Id,
  reportId: string,
  input: { action?: unknown; note?: unknown }
) => {
  const action = String(input.action ?? "").trim().toLowerCase();
  if (action !== "dismiss" && action !== "remove") {
    throw new Error("Invalid action. Use dismiss or remove");
  }
  const note = String(input.note ?? "").trim();
  if (note.length > 1000) throw new Error("note must be 1000 characters or fewer");

  const report = await PulseReport.findById(reportId).lean();
  if (!report) throw new Error("Report not found");

  let contentRemoved = false;
  if (action === "remove") {
    if (report.targetType === "comment") {
      const result = await PulseComment.deleteOne({ _id: report.comment });
      contentRemoved = result.deletedCount > 0;
    } else {
      const post = await PulsePost.findById(report.post).select("_id repostedFrom isQuote").lean();
      if (post) {
        await deletePulsePostCore(post);
        contentRemoved = true;
      }
    }
  }

  const status: PulseReportStatus = action === "remove" ? "removed" : "dismissed";
  const update = {
    $set: {
      status,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      ...(note ? { adminNote: note } : {}),
    },
  };
  const result = await PulseReport.updateMany(
    {
      $or: [
        { _id: report._id },
        {
          status: "open",
          targetType: report.targetType,
          post: report.post,
          comment: report.comment ?? null,
        },
      ],
    },
    update
  );

  return {
    reportId: String(report._id),
    action,
    status,
    contentRemoved,
    reportsUpdated: result.modifiedCount,
  };
};
