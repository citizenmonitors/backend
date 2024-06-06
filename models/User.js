import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["observer", "volunteer"] },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  gender: String,
  dateOfBirth: String,
  state: String,
  localGovernment: String,
  ward: String,
  pollingUnit: String,
  isRegisteredVoter: Boolean,
  isPoliticalPartyMember: Boolean,
  isElectionWitnessReady: Boolean,
  isOpenToSurvey: Boolean,
  // Volunteer specific fields
  governmentId: String,
  phoneNumber: String,
  bankName: String,
  bankAccountNumber: String,
  bankAccountName: String,
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationCode: { type: String },
});

export default mongoose.model("User", userSchema);
