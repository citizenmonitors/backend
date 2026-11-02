import mongoose from "mongoose";
const likeUserSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
    },
}, { _id: false });
const pulsePostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
        index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    imageUrl: { type: String, trim: true },
    visibilityScope: {
        type: String,
        enum: ["all", "state", "lga", "ward", "polling-unit"],
        default: "all",
        index: true,
    },
    audienceState: { type: String, trim: true, index: true },
    audienceLga: { type: String, trim: true, index: true },
    audienceWard: { type: String, trim: true, index: true },
    audiencePollingUnit: { type: String, trim: true, index: true },
    repostedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PulsePost",
        index: true,
    },
    /** true = quote post: the author's own text (and optional image) on top of repostedFrom. */
    isQuote: { type: Boolean, default: false, index: true },
    repostCount: { type: Number, default: 0, min: 0 },
    quoteCount: { type: Number, default: 0, min: 0 },
    useAnonymousDisplay: { type: Boolean, default: false },
    /** Set only when the text or image is edited (not on likes, counts, etc.). */
    editedAt: { type: Date, default: null },
    likes: [likeUserSchema],
}, { timestamps: true });
pulsePostSchema.index({
    visibilityScope: 1,
    audienceState: 1,
    audienceLga: 1,
    audienceWard: 1,
    audiencePollingUnit: 1,
    createdAt: -1,
});
pulsePostSchema.index({ author: 1, repostedFrom: 1 });
const PulsePost = mongoose.model("PulsePost", pulsePostSchema);
/** Drop the old sparse unique index — `repostedFrom: null` collided and broke likes/creates. */
const dropUnsafeRepostUniqueIndex = async () => {
    try {
        const indexes = await PulsePost.collection.indexes();
        const unsafe = indexes.find((idx) => Boolean(idx.unique) &&
            idx.key?.author === 1 &&
            idx.key?.repostedFrom === 1 &&
            !idx.partialFilterExpression);
        if (unsafe?.name) {
            await PulsePost.collection.dropIndex(unsafe.name);
        }
    }
    catch {
        // Collection or index may not exist yet.
    }
};
if (mongoose.connection.readyState === 1) {
    void dropUnsafeRepostUniqueIndex();
}
else {
    mongoose.connection.once("open", () => {
        void dropUnsafeRepostUniqueIndex();
    });
}
export default PulsePost;
//# sourceMappingURL=PulsePost.js.map