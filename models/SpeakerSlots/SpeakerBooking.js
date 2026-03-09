import mongoose from "mongoose";

const speakerBookingSchema = new mongoose.Schema(
  {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "SpeakerSlot", required: true },
    inviteId: { type: mongoose.Schema.Types.ObjectId, ref: "SpeakerInvite", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    xHandle: { type: String, required: true },
    bioLink: { type: String, default: "" },
    topicAngle: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: { type: String, default: "confirmed", enum: ["confirmed", "cancelled", "pending"] },
    remindersSent: {
      sent7d: { type: Date, default: null },
      sent24h: { type: Date, default: null },
      sent2h: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

speakerBookingSchema.index({ slotId: 1 });
speakerBookingSchema.index({ inviteId: 1 });
speakerBookingSchema.index({ email: 1, slotId: 1 });

export default mongoose.model("SpeakerBooking", speakerBookingSchema);
