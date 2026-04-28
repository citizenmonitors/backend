import mongoose from "mongoose";
const likeUserSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
    },
}, { _id: false });
const collationReportCommentSchema = new mongoose.Schema({
    activeElection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ActiveElection",
        required: true,
        index: true,
    },
    targetType: {
        type: String,
        required: true,
        enum: ["election_result", "incident_report"],
        index: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
        index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 8000 },
    /** When true, public display uses `anonymousUsername` if set; otherwise real name. */
    useAnonymousDisplay: { type: Boolean, default: false },
    likes: [likeUserSchema],
}, { timestamps: true });
collationReportCommentSchema.index({
    activeElection: 1,
    targetType: 1,
    targetId: 1,
    createdAt: -1,
});
export default mongoose.model("CollationReportComment", collationReportCommentSchema);
//# sourceMappingURL=CollationReportComment.js.map