import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema(
  {
    electionType: {
      type: String,
      enum: [
        "presidential",
        "senatorial",
        "gubernatorial",
        "house-of-representatives",
        "state-house-of-assembly",
      ],
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Election", ElectionSchema);
