import crypto from "crypto";
import CompletedUser from "../../models/CompletedUser.ts";
import User from "../../models/User.ts";
import {
  authenticateUser,
  registerUser,
  resendTokenService,
  selectUserRole,
  submitObserverDetails,
  submitRoleFormDetails,
  validateTokenService,
  verifyUserEmail,
} from "../authService.ts";
import { sendEmail } from "../../config/email.ts";
import { passwordResetOtpTemplate } from "../../config/emailTemplates.ts";
import { generateToken } from "../../utils/generateToken.ts";
import { hashPassword } from "../../utils/hashPassword.ts";
import { verifyJwtEmail } from "../../utils/authToken.ts";

type MobileMetaInput = {
  platform?: string;
  deviceId?: string;
  appVersion?: string;
  pushToken?: string;
};

type GoogleTokenInfo = {
  sub: string;
  email: string;
  email_verified: string;
  aud: string;
};

const getAllowedGoogleClientIds = (): string[] => {
  const candidates = [
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
    ...(process.env.GOOGLE_CLIENT_IDS?.split(",") ?? []),
    process.env.GOOGLE_CLIENT_ID, // backward compatibility
  ];

  return [...new Set(candidates.map((id) => id?.trim()).filter(Boolean) as string[])];
};

type MulterLikeFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

const mobileMetaPatch = (mobileMeta?: MobileMetaInput) => ({
  ...(mobileMeta?.platform ? { "mobileMeta.platform": mobileMeta.platform } : {}),
  ...(mobileMeta?.deviceId ? { "mobileMeta.deviceId": mobileMeta.deviceId } : {}),
  ...(mobileMeta?.appVersion ? { "mobileMeta.appVersion": mobileMeta.appVersion } : {}),
  ...(mobileMeta?.pushToken ? { "mobileMeta.pushToken": mobileMeta.pushToken } : {}),
  "mobileMeta.lastLoginAt": new Date(),
});

async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!response.ok) {
    throw new Error("Invalid Google token");
  }

  const data = (await response.json()) as GoogleTokenInfo;
  if (!data.email || data.email_verified !== "true") {
    throw new Error("Google account email is not verified");
  }

  const allowedAudiences = getAllowedGoogleClientIds();
  if (allowedAudiences.length > 0 && !allowedAudiences.includes(data.aud)) {
    throw new Error("Google token audience mismatch");
  }

  return data;
}

export const mobileRegister = async (
  payload: { email: string; password: string; confirmPassword: string },
  mobileMeta?: MobileMetaInput
) => {
  await registerUser(payload);
  await User.findOneAndUpdate(
    { email: payload.email },
    { $set: mobileMetaPatch(mobileMeta) }
  );
};

export const mobileVerifyEmail = async (email: string, verificationCode: string) => {
  return verifyUserEmail(email, verificationCode);
};

export const mobileResendToken = async (email: string) => {
  return resendTokenService(email);
};

export const mobileContinueWithGoogle = async (
  idToken: string,
  mobileMeta?: MobileMetaInput
) => {
  const googleInfo = await verifyGoogleIdToken(idToken);
  const email = googleInfo.email.toLowerCase();
  const providerPatch = {
    ...mobileMetaPatch(mobileMeta),
    "authProviders.google.googleId": googleInfo.sub,
    "authProviders.google.emailVerified": true,
    "authProviders.google.linkedAt": new Date(),
  };

  const existingCompletedUser = await CompletedUser.findOne({ email });
  if (existingCompletedUser) {
    throw new Error("This email is already registered. Please sign in.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const needsPlaceholder =
      !existingUser.password || existingUser.password.length === 0;
    await User.updateOne(
      { email },
      {
        $set: {
          ...providerPatch,
          ...(needsPlaceholder
            ? {
                password: await hashPassword(
                  crypto.randomBytes(32).toString("hex")
                ),
                hasSetPassword: false,
              }
            : {}),
        },
      }
    );
    const refreshed = await User.findOne({ email });
    const token = generateToken({ email });
    const u = refreshed ?? existingUser;
    const { password, ...user } = u.toObject();
    const mustSetPassword = u.hasSetPassword === false || needsPlaceholder;
    const nextAfterPassword = u.hasSubmittedRoleForm
    ? "user_coverage"
      : "select_role";
    return {
      token,
      user,
      requiresPasswordSetup: mustSetPassword,
      nextStep: mustSetPassword ? "set_password" : nextAfterPassword,
    };
  }

  const googlePlaceholderPassword = await hashPassword(
    crypto.randomBytes(32).toString("hex")
  );
  const newUser = await User.create({
    email,
    password: googlePlaceholderPassword,
    isVerified: true,
    hasSetPassword: false,
    hasSubmittedRoleForm: false,
    mobileMeta: {
      platform: mobileMeta?.platform,
      deviceId: mobileMeta?.deviceId,
      appVersion: mobileMeta?.appVersion,
      pushToken: mobileMeta?.pushToken,
      lastLoginAt: new Date(),
    },
    authProviders: {
      google: {
        googleId: googleInfo.sub,
        emailVerified: true,
        linkedAt: new Date(),
      },
    },
  });

  const token = generateToken({ email });
  const { password, ...user } = newUser.toObject();
  return {
    token,
    user,
    requiresPasswordSetup: true,
    nextStep: "set_password",
  };
};
export const mobileSetPassword = async (
  bearerToken: string,
  password: string
) => {
  const email = verifyJwtEmail(bearerToken);
  const hashed = await hashPassword(password);
  const completedUser = await CompletedUser.exists({ email });
  if (completedUser) {
    throw new Error("This email is already registered. Please sign in.");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  user.password = hashed;
  user.hasSetPassword = true;
  await user.save();
  return { message: "Password set successfully.", nextStep: "user_coverage" };
};

export const mobileSubmitDetails = async (
  input: { email: string; details: Record<string, unknown>; file?: MulterLikeFile }
) => {
  return submitRoleFormDetails(input);
};

export const mobileSelectRole = async (email: string, role: string) => {
  if (role === "public-viewer") {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found.");
    }
    if (!user.isVerified) {
      throw new Error("User has not verified their email.");
    }
    if (!user.hasSubmittedRoleForm) {
      throw new Error("You must submit your details before selecting a role");
    }
    if (!user.hasSetPassword) {
      throw new Error("Please set your password before selecting a role.");
    }

    user.role = "public-viewer";
    await user.save();

    const completedUserData = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      state: user.state,
      lga: user.lga,
      ward: user.ward,
      pollingUnit: user.pollingUnit,
      isRegisteredVoter: user.isRegisteredVoter,
      isPoliticalPartyMember: user.isPoliticalPartyMember,
      isElectionWitnessReady: user.isElectionWitnessReady,
      isOpenToSurvey: user.isOpenToSurvey,
      nationality: user.nationality,
      whyYouJoinUs: user.whyYouJoinUs,
      profileImage: user.profileImage,
      pendingObserverVerification: false,
      password: user.password,
      hasSetPassword: true,
    };

    const completedUser = new CompletedUser(completedUserData);
    await completedUser.save();
    await user.deleteOne();

    const token = generateToken({ email: completedUser.email });
    const { password, ...userDetails } = completedUser.toObject();

    return {
      message:
        "Public viewer role selected and completed. You have been registered.",
      token,
      user: userDetails,
      nextStep: "done",
    };
  }

  return selectUserRole(email, role);
};

export const mobileSubmitObserverDetails = async (input: {
  email: string;
  observerIdFiles?: MulterLikeFile[];
}) => {
  return submitObserverDetails({
    email: input.email,
    observerIdFiles: input.observerIdFiles,
  });
};

export const mobileSignIn = async (
  payload: { email: string; password: string },
  mobileMeta?: MobileMetaInput
) => {
  const existingUser = await CompletedUser.findOne({ email: payload.email }).lean();
  if (existingUser && existingUser.hasSetPassword === false) {
    throw new Error("The email or password you entered is incorrect");
  }

  const { token, user } = await authenticateUser(payload);
  await CompletedUser.findOneAndUpdate(
    { email: payload.email },
    { $set: mobileMetaPatch(mobileMeta) }
  );
  return { token, user };
};

export const mobileForgotPassword = async (email: string) => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const completedUser = await CompletedUser.findOne({ email });
  if (completedUser) {
    completedUser.resetPasswordOTP = otp;
    completedUser.resetPasswordOTPExpires = expiresAt;
    await completedUser.save();
  } else {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No account found with this email address");
    }
    throw new Error(
      "Please complete your registration in the app before resetting your password."
    );
  }

  await sendEmail({
    to: email,
    subject: "Your Password Reset OTP - Citizen Monitors",
    htmlbody: passwordResetOtpTemplate(otp),
  });
  return { message: "Password reset OTP sent to your email." };
};

export const mobileResendForgotPasswordOtp = async (email: string) => {
  return mobileForgotPassword(email);
};

export const mobileResetPassword = async (
  email: string,
  otp: string,
  password: string
) => {
  const hashed = await hashPassword(password);
  const now = new Date();

  const completedUser = await CompletedUser.findOne({ email });
  if (completedUser) {
    if (completedUser.resetPasswordOTP !== otp) {
      throw new Error("Invalid OTP");
    }
    if (
      !completedUser.resetPasswordOTPExpires ||
      completedUser.resetPasswordOTPExpires < now
    ) {
      throw new Error("OTP has expired");
    }
    completedUser.password = hashed;
    completedUser.resetPasswordOTP = undefined;
    completedUser.resetPasswordOTPExpires = undefined;
    await completedUser.save();
    return { message: "Password reset successful." };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No account found with this email address");
  }
  throw new Error(
    "Please complete your registration in the app before resetting your password."
  );
};

export const mobileValidateSession = async (token: string) => {
  return validateTokenService(token);
};


