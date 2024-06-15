import mongoose from "mongoose";

const ElectionDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    resultSheets: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    votes: {
      type: Array,
      default: [],
    },
    rating: {
      type: String,
      enum: ["good", "okay", "bad"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ElectionData", ElectionDataSchema);
