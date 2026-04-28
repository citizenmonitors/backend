import mongoose from "mongoose";

const mobileFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
      required: true,
      index: true,
    },
    email: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("MobileFeedback", mobileFeedbackSchema);
