import mongoose from "mongoose";

const donationSessionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 1 },
    amountMinor: { type: Number, required: true, min: 1 },
    currency: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: ["ngn", "usd", "gbp", "eur"],
    },
    source: {
      type: String,
      required: true,
      enum: ["web", "mobile"],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "canceled", "expired"],
      default: "pending",
      index: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

donationSessionSchema.index({ createdAt: -1 });

export default mongoose.model("DonationSession", donationSessionSchema);
