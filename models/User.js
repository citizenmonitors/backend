import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationToken: { type: String },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["observer", "volunteer"], default: null },
  // Common fields
  firstName: String,
  lastName: String,
  gender: String,
  state: String,
  localGovernment: String,
  ward: String,
  pullingUnit: String,
  registeredVoter: Boolean,
  politicalParty: Boolean,
  electionWitness: Boolean,
  politicalSurvey: Boolean,
  // Volunteer specific fields
  governmentId: String,
  phoneNumber: String,
  bankName: String,
  bankAccountNumber: String,
  accountName: String,
  
});

export default mongoose.model("User", userSchema);
