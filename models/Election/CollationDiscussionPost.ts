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

const collationDiscussionPostSchema = new mongoose.Schema(
  {
    activeElection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveElection",
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
    imageUrls: [{ type: String, trim: true }],
    videoUrls: [{ type: String, trim: true }],
    allowSocialShare: { type: Boolean, default: true },
    useAnonymousDisplay: { type: Boolean, default: false },
    likes: [likeUserSchema],
  },
  { timestamps: true }
);

collationDiscussionPostSchema.index({ activeElection: 1, createdAt: -1 });

export default mongoose.model("CollationDiscussionPost", collationDiscussionPostSchema);
