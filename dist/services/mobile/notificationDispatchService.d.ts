export type MobileNotificationPreferenceKey = "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsletter";
type RecipientRole = "all" | "observer" | "volunteer" | "public-viewer" | "admin" | "super-admin";
export declare const dispatchMobileNotification: (input: {
    type: "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "newsletter" | "election-day-alert";
    preferenceKey: MobileNotificationPreferenceKey;
    body: string;
    info?: string;
    recipients: RecipientRole[];
    audienceQuery?: Record<string, unknown>;
}) => Promise<(import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    targetUsers: import("mongoose").Types.ObjectId[];
    readBy: import("mongoose").Types.ObjectId[];
    deletedBy: import("mongoose").Types.ObjectId[];
    type?: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | null | undefined;
    info?: string | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | null | undefined;
    body?: string | null | undefined;
    recipients?: string[] | null | undefined;
}> & {
    createdAt: NativeDate;
    targetUsers: import("mongoose").Types.ObjectId[];
    readBy: import("mongoose").Types.ObjectId[];
    deletedBy: import("mongoose").Types.ObjectId[];
    type?: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | null | undefined;
    info?: string | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | null | undefined;
    body?: string | null | undefined;
    recipients?: string[] | null | undefined;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}) | null>;
export declare const dispatchNotificationToUsers: (input: {
    type: "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "newsletter" | "election-day-alert";
    preferenceKey: MobileNotificationPreferenceKey;
    body: string;
    info?: string;
    userIds: Array<string>;
}) => Promise<(import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    targetUsers: import("mongoose").Types.ObjectId[];
    readBy: import("mongoose").Types.ObjectId[];
    deletedBy: import("mongoose").Types.ObjectId[];
    type?: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | null | undefined;
    info?: string | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | null | undefined;
    body?: string | null | undefined;
    recipients?: string[] | null | undefined;
}> & {
    createdAt: NativeDate;
    targetUsers: import("mongoose").Types.ObjectId[];
    readBy: import("mongoose").Types.ObjectId[];
    deletedBy: import("mongoose").Types.ObjectId[];
    type?: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | null | undefined;
    info?: string | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | null | undefined;
    body?: string | null | undefined;
    recipients?: string[] | null | undefined;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}) | null>;
export {};
//# sourceMappingURL=notificationDispatchService.d.ts.map