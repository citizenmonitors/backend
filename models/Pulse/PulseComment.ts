import mongoose from "mongoose";

const likeUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
      required: true,
    },
  },
  { _id: false }
);

const pulseCommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PulsePost",
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
    /** Set only when the text or image is edited (not on likes, counts, etc.). */
    editedAt: { type: Date, default: null },
    likes: [likeUserSchema],
  },
  { timestamps: true }
);

pulseCommentSchema.index({ post: 1, createdAt: -1 });

export default mongoose.model("PulseComment", pulseCommentSchema);
