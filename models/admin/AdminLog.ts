import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompletedUser",
    required: true,
  },
  action: { type: String, required: true },
  details: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AdminLog", adminLogSchema);

