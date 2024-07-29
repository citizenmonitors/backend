import mongoose from "mongoose";

const completedUserSchema = new mongoose.Schema({
  role: { type: String, enum: ["observer", "volunteer", "admin"] },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  gender: String,
  dateOfBirth: String,
  state: String,
  lga: String,
  ward: String,
  pollingUnit: String,
  isRegisteredVoter: Boolean,
  isPoliticalPartyMember: Boolean,
  isElectionWitnessReady: Boolean,
  isOpenToSurvey: Boolean,
  verificationCode: String,
  verificationCodeExpires: Date,
  isActive: Boolean,
  lastLogin: Date,
  // Volunteer specific fields
  governmentId: String,
  phoneNumber: String,
  bankName: String,
  bankAccountNumber: String,
  bankAccountName: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  password: { type: String, required: true },
});

export default mongoose.model("CompletedUser", completedUserSchema);
