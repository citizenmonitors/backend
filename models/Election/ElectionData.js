import mongoose from "mongoose";

const ElectionDataSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    lga: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      required: true,
    },
    pollingUnit: {
      type: String,
      required: true,
    },
    resultSheets: [
      {
        type: String,
        required: true,
      },
    ],
    resultVideos: [
      {
        type: String,
        required: true,
      },
    ],
    partiesVotes: [
      {
        party: String,
        count: Number,
      },
    ],
    otherPartiesVotes: [
      {
        party: String,
        count: Number,
      },
    ],
    rating: {
      type: String,
      enum: ["good", "okay", "bad"],
      required: true,
    },
    voterIntimidation: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    voteBuying: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ElectionData", ElectionDataSchema);
