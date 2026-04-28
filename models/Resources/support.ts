import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    category: {
      type: String,
      required: true,
    },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SupportRequest", supportSchema);

