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

const pulsePostSchema = new mongoose.Schema(
  {
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
      enum: ["ward", "lga"],
      default: "lga",
      index: true,
    },
    audienceState: { type: String, trim: true, required: true, index: true },
    audienceLga: { type: String, trim: true, required: true, index: true },
    audienceWard: { type: String, trim: true, index: true },
    useAnonymousDisplay: { type: Boolean, default: false },
    likes: [likeUserSchema],
  },
  { timestamps: true }
);

pulsePostSchema.index({
  visibilityScope: 1,
  audienceState: 1,
  audienceLga: 1,
  audienceWard: 1,
  createdAt: -1,
});

export default mongoose.model("PulsePost", pulsePostSchema);
