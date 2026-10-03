import mongoose from "mongoose";
import { fileSchema } from "../file.js";

const incidentReportSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveElection",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
      // Optional so account deletion can keep incidents for collation.
      required: false,
      default: null,
    },
    /** Set when the uploader deletes their account; incidents stay for collation. */
    uploaderDeleted: {
      type: Boolean,
      default: false,
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
    uploadLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
      accuracy: Number,
      capturedAt: Date,
    },
    selectIncident: {
      type: String,
      required: true,
      enum: [
        "Ballot Stuffing",
        "Thuggery & Violence",
        "Underage Voting",
        "INEC Misconduct",
        "Result Alteration",
        "Voter Intimidation",
        "Late Opening",
        "Missing Materials",
        "Other Incidents",
        // Legacy web values (kept for backward compatibility)
        "Thuggery and Violence",
        "Lack of electoral materials",
        "Fraudulent electoral officers",
        "Late commencement",
        "Over voting",
        "Other",
      ],
    },
    incidentNote: { type: String, required: true },
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
        flagImage: fileSchema,
        flagVideo: fileSchema,
        evidenceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "IncidentReport",
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
    priorityLevel: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("IncidentReport", incidentReportSchema);

