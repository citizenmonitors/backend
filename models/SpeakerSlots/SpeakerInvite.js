import mongoose from "mongoose";
import crypto from "crypto";

const speakerInviteSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "SpeakerEvent", required: true },
    expiresAt: { type: Date, required: true },
    email: { type: String, default: null },
  },
  { timestamps: true }
);

speakerInviteSchema.index({ expiresAt: 1 });

speakerInviteSchema.statics.generateToken = function () {
  return crypto.randomBytes(24).toString("hex");
};

export default mongoose.model("SpeakerInvite", speakerInviteSchema);
