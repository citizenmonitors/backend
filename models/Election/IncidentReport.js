import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  location: String,
  name: String,
  type: String,
  size: Number,
});

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
  selectIncident: {
    type: String,
    enum: [
      "Thuggery and Violence",
      "Lack of electoral materials",
      "Fraudulent electoral officers",
      "Late commencement",
      "Over voting",
      "Other",
    ],
  },
  incidentNote: { type: String },
  electionRating: { type: String },
  incidentPictures: [fileSchema],
  incidentVideos: fileSchema,
});

export default mongoose.model("IncidentReport", incidentReportSchema);