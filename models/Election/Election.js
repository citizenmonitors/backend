import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema(
  {
    electionType: {
      type: String,
      required: true,
    },
    electionName: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
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
        name: { type: String, },
        code: { type: String, },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Election", ElectionSchema);
