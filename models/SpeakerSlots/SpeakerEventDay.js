import mongoose from "mongoose";

const speakerEventDaySchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "SpeakerEvent", required: true },
    label: { type: String, required: true },
    date: { type: String, required: true },
    theme: { type: String, required: true },
    sortOrder: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

speakerEventDaySchema.index({ eventId: 1, sortOrder: 1 });

export default mongoose.model("SpeakerEventDay", speakerEventDaySchema);
