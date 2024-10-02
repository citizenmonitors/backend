import mongoose from "mongoose";
import { fileSchema } from "../file.js";


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
    resultPicture: fileSchema,
    resultVideo: fileSchema,

    partiesVotes: [
      {
        party: String,
        count: Number,
      },
    ],
    voteRating: {
      type: String,
      enum: ["good", "okay", "poor"],
    },
    voterIntimidation: {
      type: String,
      enum: ["yes", "no"],
    },
    voteBuying: {
      type: String,
      enum: ["yes", "no"],
    },
    actions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CompletedUser",
        },
        action: {
          type: String,
          enum: ["agree", "flag"],
          required: true,
        },
        flagReason: {
          type: String,
        },
      },
    ],
    agreed: {
      type: Boolean,
      default: false,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    timeBegan: {
      type: String,
    },
    accreditedVoters: {
      type: Number,
    },
    rejectedVoters: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ElectionData", ElectionDataSchema);

