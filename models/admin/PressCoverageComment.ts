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

const pressCoverageCommentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PressCoverage",
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
    likes: { type: [likeUserSchema], default: [] },
  },
  { timestamps: true }
);

pressCoverageCommentSchema.index({ article: 1, createdAt: -1 });

export default mongoose.model("PressCoverageComment", pressCoverageCommentSchema);
