import mongoose from "mongoose";
export const PULSE_REPORT_REASONS = [
    "spam",
    "harassment",
    "hate",
    "violence",
    "sexual",
    "misinformation",
    "other",
];
export const PULSE_REPORT_STATUSES = ["open", "dismissed", "removed"];
const pulseReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
        index: true,
    },
    targetType: { type: String, enum: ["post", "comment"], required: true },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PulsePost",
        required: true,
        index: true,
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PulseComment",
        default: null,
        index: true,
    },
    /** Author of the reported content. */
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
        index: true,
    },
    reason: { type: String, enum: PULSE_REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 1000 },
    /** Copy of the content at report time, kept even if the content is later deleted. */
    snapshot: {
        body: { type: String },
        imageUrl: { type: String },
    },
    status: {
        type: String,
        enum: PULSE_REPORT_STATUSES,
        default: "open",
        index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "CompletedUser" },
    reviewedAt: { type: Date },
    adminNote: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });
// One report per user per post or comment (comment is null for post reports).
pulseReportSchema.index({ reporter: 1, targetType: 1, post: 1, comment: 1 }, { unique: true });
pulseReportSchema.index({ status: 1, createdAt: -1 });
export default mongoose.model("PulseReport", pulseReportSchema);
//# sourceMappingURL=PulseReport.js.map