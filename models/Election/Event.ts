import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    electionType: {
      type: String,
      required: true,
    },
    electionLocation: {
      type: String,
      required: true,
    },
    electionName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    email: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);

