import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["result-upload", "pending-approval"],
  },
  body: {
    type: String,
  },
  info: {
    type: String,
  },
  recipients: {
    type: [String],
    enum: ["all", "super-admin", "admin", "observer", "volunteer"],
    default: undefined,
  },
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