import mongoose from "mongoose";

const speakerEventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model("SpeakerEvent", speakerEventSchema);

