import mongoose from "mongoose";

const ActiveElectionSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    electionLocation: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    results: [{ type: mongoose.Schema.Types.ObjectId, ref: "ElectionData" }],
    incidentReports: [
      { type: mongoose.Schema.Types.ObjectId, ref: "IncidentReport" },
    ],
    resultsCount: {
      type: Number,
      default: 0,
    },
    politicalParties: [
      {
        name: { type: String },
        code: { type: String },
        imageUrl: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ActiveElection", ActiveElectionSchema);


