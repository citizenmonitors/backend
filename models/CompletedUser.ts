import mongoose from "mongoose";
import { observerIdSchema } from "./observerIds/observerIdModel.js";
import { profileImageSchema } from "./UserProfileImage/ProfileImageModel.js";

const completedUserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["observer", "volunteer", "public-viewer", "admin", "super-admin"],
    },
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
    nationality: String,
    whyYouJoinUs: String,
    anonymousUsername: { type: String, index: true, sparse: true },
    useAnonymousIdentity: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,
    isObserverInPollingUnit: { type: Boolean, default: false },
    pendingObserverVerification: { type: Boolean, default: true },
    isActive: Boolean,
    lastLogin: Date,
    coverageUpdateCount: { type: Number, default: 0 },
    // Observer specific fields
    observerId: [observerIdSchema],
    phoneNumber: String,
    bankName: String,
    bankAccountNumber: String,
    bankAccountName: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    password: { type: String, required: true },
    hasSubmittedRoleForm: { type: Boolean, default: false },
    hasSetPassword: { type: Boolean, default: true },
    mobileMeta: {
      platform: String,
      deviceId: String,
      appVersion: String,
      pushToken: String,
      lastLoginAt: Date,
    },
    authProviders: {
      google: {
        googleId: String,
        emailVerified: Boolean,
        linkedAt: Date,
      },
    },
    adminPermissions: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminPermissions",
    },
    notifications: {
      email: {
        inbox: {
          type: Boolean,
          default: true,
        },
        election: {
          type: Boolean,
          default: true,
        },
        newsletter: {
          type: Boolean,
          default: true,
        },
      },
      mobile: {
        pollingUnitActivity: {
          type: Boolean,
          default: true,
        },
        electionDayAlert: {
          type: Boolean,
          default: false,
        },
        discussionReplies: {
          type: Boolean,
          default: false,
        },
        resultAggregated: {
          type: Boolean,
          default: false,
        },
        reportConfirmed: {
          type: Boolean,
          default: false,
        },
        reportFlagged: {
          type: Boolean,
          default: false,
        },
        securityAlerts: {
          type: Boolean,
          default: false,
        },
        newsletter: {
          type: Boolean,
          default: true,
        },
        newsAndInsights: {
          type: Boolean,
          default: true,
        },
        pressCoverage: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CompletedUser", completedUserSchema);

