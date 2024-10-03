import mongoose from "mongoose";
import { observerIdSchema } from "./observerIds/observerIdModel.js";
import { profileImageSchema } from "./UserProfileImage/ProfileImageModel.js";

const completedUserSchema = new mongoose.Schema({
  role: { type: String, enum: ["observer", "volunteer", "admin"] },
  email: { type: String, required: true, unique: true },
  pendingEmail: String,
  firstName: String,
  lastName: String,
  gender: String,
  dateOfBirth: String,
  profileImage: profileImageSchema,
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
  isObserverInPollingUnit: { type: Boolean, default: false },
  pendingObserverVerification: { type: Boolean, default: true },
  isActive: Boolean,
  lastLogin: Date,
  // Observer specific fields
  observerId: [observerIdSchema],
  phoneNumber: String,
  bankName: String,
  bankAccountNumber: String,
  bankAccountName: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  password: { type: String, required: true },
});

export default mongoose.model("CompletedUser", completedUserSchema);
