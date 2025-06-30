import mongoose from "mongoose";
import { fileSchema } from "../file.js";


const ElectionDataSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveElection",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
      required: true,
    },
    userRole: {
      type: String,
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
        evidenceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ElectionData",
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
    hidden: {
      type: Boolean,
      default: false,
    },
    // isApproved: {
    //   type: Boolean,
    //   default: false,
    // },
    timeBegan: {
      type: String,
    },
    accreditedVoters: {
      type: Number,
    },
    rejectedPapers: {
      type: Number,
    },
    spoiledBallotPapers: {
      type: Number,
    },
    usedBallotPapers: {
      type: Number,
    },
    priorityLevel: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ElectionData", ElectionDataSchema);

