import mongoose from "mongoose";

const completedUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["observer", "volunteer"] },
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
  resetPasswordToken: { type: String, required: false },
  resetPasswordExpires: { type: Date, required: false },
});

export default mongoose.model("CompletedUser", completedUserSchema);
