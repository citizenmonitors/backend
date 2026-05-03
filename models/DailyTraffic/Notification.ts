import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "result-upload",
      "incident-upload",
      "pending-approval",
      "security-alert",
      "discussion-reply",
      "result-aggregated",
      "report-confirmed",
      "report-flagged",
      "newsletter",
      "election-day-alert",
    ],
  },
  preferenceKey: {
    type: String,
    enum: [
      "pollingUnitActivity",
      "electionDayAlert",
      "discussionReplies",
      "resultAggregated",
      "reportConfirmed",
      "reportFlagged",
      "securityAlerts",
      "newsletter",
    ],
    default: undefined,
  },
  body: {
    type: String,
  },
  info: {
    type: String,
  },
  recipients: {
    type: [String],
    enum: ["all", "super-admin", "admin", "observer", "volunteer", "public-viewer"],
    default: undefined,
  },
  targetUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
    },
  ],
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
    },
  ],
  deletedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;


