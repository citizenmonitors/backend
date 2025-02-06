import mongoose from "mongoose";
import {fileSchema} from "../file.js";


const incidentReportSchema = new mongoose.Schema(
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
    userRole: {
      type: String,
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
    incidentVideos: [fileSchema],
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
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("IncidentReport", incidentReportSchema);