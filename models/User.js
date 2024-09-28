import mongoose from "mongoose";
import { profileImageSchema } from "./UserProfileImage/ProfileImageModel.js";

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["observer", "volunteer"] },
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
  isObserverInPollingUnit: Boolean,
  pendingObserverVerification: Boolean,
  // Observer specific fields
  governmentId: String,
  phoneNumber: String,
  bankName: String,
  bankAccountNumber: String,
  bankAccountName: String,
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  // verificationToken: { type: String },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date, required: false },
});

export default mongoose.model("User", userSchema);
