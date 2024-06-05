import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["observer", "volunteer"], default: "observer" },
  verificationCode: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  gender: { type: String },
  state: { type: String },
  localGovernment: { type: String },
  ward: { type: String },
  pollingUnit: { type: String },
  registeredVoter: { type: Boolean },
  politicalParty: { type: Boolean },
  electionWitness: { type: Boolean },
  politicalSurvey: { type: Boolean },
  volunteerDetails: {
    governmentId: { type: String },
    phoneNumber: { type: String },
    bankName: { type: String },
    bankAccountNumber: { type: String },
    accountName: { type: String },
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

export default mongoose.model("User", UserSchema);
