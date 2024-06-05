import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "presidential",
        "senatorial",
        "gubernatorial",
        "house_of_representatives",
        "state_house_of_assembly",
      ],
      required: true,
    },
    signedResultImage: {
      type: String,
    },
    resultAnnouncementVideo: {
      type: String,
    },
    results: [
      {
        party: String,
        votes: Number,
      },
    ],
    ratedGood: {
      type: Boolean,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Election", ElectionSchema);
