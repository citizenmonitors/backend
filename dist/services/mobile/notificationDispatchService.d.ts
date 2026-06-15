export type MobileNotificationPreferenceKey = "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsletter" | "newsAndInsights" | "pressCoverage";
type RecipientRole = "all" | "observer" | "volunteer" | "public-viewer" | "admin" | "super-admin";
export declare const dispatchMobileNotification: (input: {
    type: "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "newsletter" | "election-day-alert" | "news-insight" | "press-coverage";
    preferenceKey: MobileNotificationPreferenceKey;
    body: string;
    info?: string;
    articleSlug?: string;
    articleId?: string;
    recipients: RecipientRole[];
    audienceQuery?: Record<string, unknown>;
    /** When false, delivers to all matched users regardless of notification prefs (transactional). */
    respectPreferences?: boolean;
}) => Promise<(import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    targetUsers: import("mongoose").Types.ObjectId[];
    readBy: import("mongoose").Types.ObjectId[];
    deletedBy: import("mongoose").Types.ObjectId[];
    type?: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
}> & {
    createdAt: NativeDate;
    targetUsers: import("mongoose").Types.ObjectId[];
    readBy: import("mongoose").Types.ObjectId[];
    deletedBy: import("mongoose").Types.ObjectId[];
    type?: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}) | null>;
export declare const dispatchNotificationToUsers: (input: {
    type: "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "newsletter" | "election-day-alert" | "news-insight" | "press-coverage";
    preferenceKey: MobileNotificationPreferenceKey;
    body: string;
    info?: string;
    articleSlug?: string;
    articleId?: string;
    userIds: Array<string>;
    respectPreferences?: boolean;
}) => Promise<(import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    targetUsers: import("mongoose").Types.ObjectId[];
    readBy: import("mongoose").Types.ObjectId[];
    deletedBy: import("mongoose").Types.ObjectId[];
    type?: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
}> & {
    createdAt: NativeDate;
    targetUsers: import("mongoose").Types.ObjectId[];
    readBy: import("mongoose").Types.ObjectId[];
    deletedBy: import("mongoose").Types.ObjectId[];
    type?: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}) | null>;
export {};
//# sourceMappingURL=notificationDispatchService.d.ts.map