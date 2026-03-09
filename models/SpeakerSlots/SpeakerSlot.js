import mongoose from "mongoose";

const speakerSlotSchema = new mongoose.Schema(
  {
    dayId: { type: mongoose.Schema.Types.ObjectId, ref: "SpeakerEventDay", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "SpeakerEvent", required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    theme: { type: String, required: true },
    capacity: { type: Number, required: true, default: 1 },
    sessionType: { type: String, default: "keynote" },
  },
  { timestamps: true }
);

speakerSlotSchema.index({ eventId: 1, dayId: 1 });

export default mongoose.model("SpeakerSlot", speakerSlotSchema);
