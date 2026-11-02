/**
 * Pulse safety: reporting posts/comments, blocking users, and admin review of reports.
 * Feed/comment filtering for blocks and reports lives in pulseService.ts.
 */
import { type Types } from "mongoose";
type Id = Types.ObjectId | string;
/**
 * Reporting a plain repost reports the original, since that's whose content it is.
 * A quote is the quoter's own text, so reporting a quote reports the quote.
 */
export declare const reportPulsePost: (userId: Id, postId: string, input: {
    reason?: unknown;
    details?: unknown;
}) => Promise<{
    id: string;
    targetType: string;
    reason: string;
    status: string;
    createdAt: Date | undefined;
}>;
export declare const reportPulseComment: (userId: Id, postId: string, commentId: string, input: {
    reason?: unknown;
    details?: unknown;
}) => Promise<{
    id: string;
    targetType: string;
    reason: string;
    status: string;
    createdAt: Date | undefined;
}>;
/** Block the author of a post or comment. Idempotent. */
export declare const blockPulseAuthor: (userId: Id, input: {
    postId?: unknown;
    commentId?: unknown;
}) => Promise<{
    id: string;
    displayName: string;
    blockedAt: Date | undefined;
}>;
/** Only the blocker can remove their block. Idempotent: an unknown id is treated as done. */
export declare const unblockPulseBlock: (userId: Id, blockId: string) => Promise<{
    id: string;
    blocked: boolean;
}>;
/** The blocker's list. Shows the name they saw, never the account id. */
export declare const listPulseBlocks: (userId: Id) => Promise<{
    id: string;
    displayName: string;
    blockedAt: Date | undefined;
}[]>;
export declare const listPulseReportsAdmin: (input: {
    status?: unknown;
    page?: number;
    limit?: number;
}) => Promise<{
    reports: {
        id: string;
        targetType: "comment" | "post";
        postId: string;
        commentId: string | null;
        reason: "spam" | "harassment" | "hate" | "violence" | "sexual" | "misinformation" | "other";
        details: string | null;
        snapshot: {
            body: string | null;
            imageUrl: string | null;
        };
        contentExists: boolean;
        openReportsOnContent: number;
        status: "open" | "dismissed" | "removed";
        reporter: {
            id: string;
            name: string | null;
            email: string | null;
            anonymousUsername: string | null;
        } | null;
        reportedUser: {
            id: string;
            name: string | null;
            email: string | null;
            anonymousUsername: string | null;
        } | null;
        adminNote: string | null;
        reviewedAt: NativeDate | null;
        createdAt: NativeDate;
    }[];
    total: number;
    page: number;
    limit: number;
    status: "all" | "open" | "dismissed" | "removed";
}>;
/**
 * "remove" deletes the reported post (with its reposts and comments) or comment.
 * Either action closes every open report on the same content.
 */
export declare const resolvePulseReportAdmin: (adminId: Id, reportId: string, input: {
    action?: unknown;
    note?: unknown;
}) => Promise<{
    reportId: string;
    action: string;
    status: "dismissed" | "removed";
    contentRemoved: boolean;
    reportsUpdated: number;
}>;
export {};
//# sourceMappingURL=pulseModerationService.d.ts.map