import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "presidential",
        "senatorial",
        "gubernatorial",
        "house-of-representatives",
        "state-house-of-assembly",
      ],
      required: true,
    },
    startDate: {
      type: String, 
      required: true,
    },
    endDate: {
      type: String, 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Election", ElectionSchema);
