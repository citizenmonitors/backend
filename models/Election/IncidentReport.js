import mongoose from "mongoose";

const incidentReportSchema = new mongoose.Schema({
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
  selectIncident: { type: String },
  incidentNote: { type: String },
  incidentPictures: [{ type: String }],
  incidentVideos: [{ type: String }],
});

export default mongoose.model("IncidentReport", incidentReportSchema);