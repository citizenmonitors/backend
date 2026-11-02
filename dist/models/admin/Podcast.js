import mongoose from "mongoose";
const podcastSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    recipients: {
        type: [String],
        enum: ["all", "super-admin", "admin", "observer", "volunteer", "public-viewer"],
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedUser",
        required: true,
    },
    readBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompletedUser",
        },
    ],
}, { timestamps: true });
export default mongoose.model("Podcast", podcastSchema);
//# sourceMappingURL=Podcast.js.map