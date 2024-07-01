import mongoose from "mongoose";


const fileSchema = new mongoose.Schema({
  location: String,
  name: String,
  type: String,
  size: Number,
});

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
      enum: ["good", "okay", "bad"],
    },
    voterIntimidation: {
      type: String,
      enum: ["yes", "no"],
    },
    voteBuying: {
      type: String,
      enum: ["yes", "no"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ElectionData", ElectionDataSchema);
