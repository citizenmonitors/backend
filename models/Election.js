import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "presidential",
        "senatorial",
        "gubernatorial",
        "house_of_representatives",
        "state_house_of_assembly",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ElectionSchema.index({ year: 1, type: 1 }, { unique: true });

export default mongoose.model("Election", ElectionSchema);