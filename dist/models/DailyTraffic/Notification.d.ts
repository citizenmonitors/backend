import mongoose from "mongoose";
declare const Notification: mongoose.Model<{
    createdAt: NativeDate;
    targetUsers: mongoose.Types.ObjectId[];
    readBy: mongoose.Types.ObjectId[];
    deletedBy: mongoose.Types.ObjectId[];
    type?: "newsletter" | "election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert" | "pending-approval" | "discussion-reply" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    activeElectionId?: mongoose.Types.ObjectId | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    targetUsers: mongoose.Types.ObjectId[];
    readBy: mongoose.Types.ObjectId[];
    deletedBy: mongoose.Types.ObjectId[];
    type?: "newsletter" | "election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert" | "pending-approval" | "discussion-reply" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    activeElectionId?: mongoose.Types.ObjectId | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
}> & {
    createdAt: NativeDate;
    targetUsers: mongoose.Types.ObjectId[];
    readBy: mongoose.Types.ObjectId[];
    deletedBy: mongoose.Types.ObjectId[];
    type?: "newsletter" | "election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert" | "pending-approval" | "discussion-reply" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    activeElectionId?: mongoose.Types.ObjectId | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    createdAt: NativeDate;
    targetUsers: mongoose.Types.ObjectId[];
    readBy: mongoose.Types.ObjectId[];
    deletedBy: mongoose.Types.ObjectId[];
    type?: "newsletter" | "election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert" | "pending-approval" | "discussion-reply" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    activeElectionId?: mongoose.Types.ObjectId | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    targetUsers: mongoose.Types.ObjectId[];
    readBy: mongoose.Types.ObjectId[];
    deletedBy: mongoose.Types.ObjectId[];
    type?: "newsletter" | "election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert" | "pending-approval" | "discussion-reply" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    activeElectionId?: mongoose.Types.ObjectId | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    targetUsers: mongoose.Types.ObjectId[];
    readBy: mongoose.Types.ObjectId[];
    deletedBy: mongoose.Types.ObjectId[];
    type?: "newsletter" | "election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert" | "pending-approval" | "discussion-reply" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    activeElectionId?: mongoose.Types.ObjectId | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Notification;
//# sourceMappingURL=Notification.d.ts.map