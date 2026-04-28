import mongoose from "mongoose";
const observerDetailsSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    state: { type: String, required: true },
    localGovernment: { type: String, required: true },
    ward: { type: String, required: true },
    pollingUnit: { type: String, required: true },
    registeredVoter: { type: Boolean, required: true },
    politicalParty: { type: Boolean, required: true },
    electionWitness: { type: Boolean, required: true },
    politicalSurvey: { type: Boolean, required: true },
});
const volunteerDetailsSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    state: { type: String, required: true },
    localGovernment: { type: String, required: true },
    ward: { type: String, required: true },
    pollingUnit: { type: String, required: true },
    registeredVoter: { type: Boolean, required: true },
    politicalParty: { type: Boolean, required: true },
    electionWitness: { type: Boolean, required: true },
    politicalSurvey: { type: Boolean, required: true },
    governmentId: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
});
// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["observer", "volunteer"], default: null },
//   isVerified: { type: Boolean, default: false },
//   verificationToken: String,
//   resetPasswordToken: String,
//   resetPasswordExpires: Date,
//   observerDetails: observerDetailsSchema,
//   volunteerDetails: volunteerDetailsSchema,
// });
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, required: false },
    verificationCodeExpires: { type: Date, required: false },
    role: { type: String, enum: ["observer", "volunteer"], default: null },
    observerDetails: { type: Object, default: null },
    volunteerDetails: { type: Object, default: null },
    formCompletion: { type: Boolean, default: false },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
});
export default mongoose.model("User", userSchema);
//# sourceMappingURL=User2.js.map