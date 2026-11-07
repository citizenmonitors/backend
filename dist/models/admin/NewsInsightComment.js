import mongoose from "mongoose";
const likeUserSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
    },
}, { _id: false });
const newsInsightCommentSchema = new mongoose.Schema({
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewsInsight",
        required: true,
        index: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
        index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 3000 },
    useAnonymousDisplay: { type: Boolean, default: false },
    /** Set only when the comment text is edited. */
    editedAt: { type: Date, default: null },
    likes: { type: [likeUserSchema], default: [] },
}, { timestamps: true });
newsInsightCommentSchema.index({ article: 1, createdAt: -1 });
export default mongoose.model("NewsInsightComment", newsInsightCommentSchema);
//# sourceMappingURL=NewsInsightComment.js.map