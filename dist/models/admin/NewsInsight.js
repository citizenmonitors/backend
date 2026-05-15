import mongoose from "mongoose";
const likeUserSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
    },
}, { _id: false });
const newsInsightSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    thumbnailUrl: { type: String, required: true, trim: true },
    heroImageUrl: { type: String, trim: true },
    publishedAt: { type: Date, required: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
    },
    likes: { type: [likeUserSchema], default: [] },
}, { timestamps: true });
export default mongoose.model("NewsInsight", newsInsightSchema);
//# sourceMappingURL=NewsInsight.js.map