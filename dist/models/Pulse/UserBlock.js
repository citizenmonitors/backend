import mongoose from "mongoose";
/** blocker no longer sees blocked's Pulse content, and neither can interact with the other's. */
const userBlockSchema = new mongoose.Schema({
    blocker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
        index: true,
    },
    blocked: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
        index: true,
    },
    /** Name as the blocker saw it when blocking (keeps anonymous authors anonymous). */
    displayName: { type: String, trim: true },
}, { timestamps: true });
userBlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
export default mongoose.model("UserBlock", userBlockSchema);
//# sourceMappingURL=UserBlock.js.map