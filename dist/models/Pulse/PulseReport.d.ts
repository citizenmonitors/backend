import mongoose from "mongoose";
export declare const PULSE_REPORT_REASONS: readonly ["spam", "harassment", "hate", "violence", "sexual", "misinformation", "other"];
export type PulseReportReason = (typeof PULSE_REPORT_REASONS)[number];
export declare const PULSE_REPORT_STATUSES: readonly ["open", "dismissed", "removed"];
export type PulseReportStatus = (typeof PULSE_REPORT_STATUSES)[number];
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    comment: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    status: "open" | "dismissed" | "removed";
    targetType: "comment" | "post";
    reason: "spam" | "harassment" | "hate" | "violence" | "sexual" | "misinformation" | "other";
    reporter: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    details?: string | null | undefined;
    snapshot?: {
        imageUrl?: string | null | undefined;
        body?: string | null | undefined;
    } | null | undefined;
    reviewedBy?: mongoose.Types.ObjectId | null | undefined;
    reviewedAt?: NativeDate | null | undefined;
    adminNote?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    comment: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    status: "open" | "dismissed" | "removed";
    targetType: "comment" | "post";
    reason: "spam" | "harassment" | "hate" | "violence" | "sexual" | "misinformation" | "other";
    reporter: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    details?: string | null | undefined;
    snapshot?: {
        imageUrl?: string | null | undefined;
        body?: string | null | undefined;
    } | null | undefined;
    reviewedBy?: mongoose.Types.ObjectId | null | undefined;
    reviewedAt?: NativeDate | null | undefined;
    adminNote?: string | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    comment: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    status: "open" | "dismissed" | "removed";
    targetType: "comment" | "post";
    reason: "spam" | "harassment" | "hate" | "violence" | "sexual" | "misinformation" | "other";
    reporter: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    details?: string | null | undefined;
    snapshot?: {
        imageUrl?: string | null | undefined;
        body?: string | null | undefined;
    } | null | undefined;
    reviewedBy?: mongoose.Types.ObjectId | null | undefined;
    reviewedAt?: NativeDate | null | undefined;
    adminNote?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    comment: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    status: "open" | "dismissed" | "removed";
    targetType: "comment" | "post";
    reason: "spam" | "harassment" | "hate" | "violence" | "sexual" | "misinformation" | "other";
    reporter: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    details?: string | null | undefined;
    snapshot?: {
        imageUrl?: string | null | undefined;
        body?: string | null | undefined;
    } | null | undefined;
    reviewedBy?: mongoose.Types.ObjectId | null | undefined;
    reviewedAt?: NativeDate | null | undefined;
    adminNote?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    comment: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    status: "open" | "dismissed" | "removed";
    targetType: "comment" | "post";
    reason: "spam" | "harassment" | "hate" | "violence" | "sexual" | "misinformation" | "other";
    reporter: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    details?: string | null | undefined;
    snapshot?: {
        imageUrl?: string | null | undefined;
        body?: string | null | undefined;
    } | null | undefined;
    reviewedBy?: mongoose.Types.ObjectId | null | undefined;
    reviewedAt?: NativeDate | null | undefined;
    adminNote?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    comment: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    status: "open" | "dismissed" | "removed";
    targetType: "comment" | "post";
    reason: "spam" | "harassment" | "hate" | "violence" | "sexual" | "misinformation" | "other";
    reporter: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    details?: string | null | undefined;
    snapshot?: {
        imageUrl?: string | null | undefined;
        body?: string | null | undefined;
    } | null | undefined;
    reviewedBy?: mongoose.Types.ObjectId | null | undefined;
    reviewedAt?: NativeDate | null | undefined;
    adminNote?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=PulseReport.d.ts.map