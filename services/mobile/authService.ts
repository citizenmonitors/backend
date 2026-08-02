import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
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
import { hashPassword } from "../../utils/hashPassword.ts";
import { verifyJwtEmail } from "../../utils/authToken.ts";
import {
  issueAuthTokens,
  revokeAllRefreshTokensForEmail,
} from "../authTokenService.ts";

type MobileMetaInput = {
  platform?: string;
  deviceId?: string;
  appVersion?: string;
  pushToken?: string;
};

type GoogleIdTokenPayload = {
  sub: string;
  email: string;
};

const googleOAuthClient = new OAuth2Client();

const getAllowedGoogleClientIds = (): string[] => {
  const candidates = [
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
    process.env.GOOGLE_WEB_CLIENT_ID,
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

async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdTokenPayload> {
  const normalizedToken = idToken.trim().replace(/^Bearer\s+/i, "");
  const allowedAudiences = getAllowedGoogleClientIds();

  let ticket;
  try {
    ticket = await googleOAuthClient.verifyIdToken({
      idToken: normalizedToken,
      ...(allowedAudiences.length > 0 ? { audience: allowedAudiences } : {}),
    });
  } catch {
    throw new Error("Invalid Google token");
  }

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error("Invalid Google token");
  }
  if (!payload.email_verified) {
    throw new Error("Google account email is not verified");
  }

  return { sub: payload.sub, email: payload.email };
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
  const googleInfo = await verifyGoogleIdToken(idToken.trim());
  const email = googleInfo.email.toLowerCase();
  const providerPatch = {
    ...mobileMetaPatch(mobileMeta),
    "authProviders.google.googleId": googleInfo.sub,
    "authProviders.google.emailVerified": true,
    "authProviders.google.linkedAt": new Date(),
  };

  const existingCompletedUser = await CompletedUser.findOne({ email });
  if (existingCompletedUser) {
    await CompletedUser.updateOne(
      { email },
      {
        $set: {
          ...providerPatch,
          isActive: true,
          lastLogin: new Date(),
        },
      }
    );
    const refreshed = await CompletedUser.findOne({ email });
    const u = refreshed ?? existingCompletedUser;
    const { password, ...user } = u.toObject();
    const tokens = await issueAuthTokens(email, {
      deviceId: mobileMeta?.deviceId,
    });
    return {
      ...tokens,
      user,
      requiresPasswordSetup: u.hasSetPassword === false,
      nextStep: "done",
    };
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
    const tokens = await issueAuthTokens(email, {
      deviceId: mobileMeta?.deviceId,
    });
    const u = refreshed ?? existingUser;
    const { password, ...user } = u.toObject();
    const mustSetPassword = u.hasSetPassword === false || needsPlaceholder;
    const nextAfterPassword = u.hasSubmittedRoleForm
    ? "user_coverage"
      : "select_role";
    return {
      ...tokens,
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

  const tokens = await issueAuthTokens(email, {
    deviceId: mobileMeta?.deviceId,
  });
  const { password, ...user } = newUser.toObject();
  return {
    ...tokens,
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

    const tokens = await issueAuthTokens(completedUser.email);
    const { password, ...userDetails } = completedUser.toObject();

    return {
      message:
        "Public viewer role selected and completed. You have been registered.",
      ...tokens,
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
  const email = payload.email.toLowerCase();

  const googleOnlySignInMessage =
    "Continue with Google to sign in, or set a password first.";

  const completedUser = await CompletedUser.findOne({ email }).lean();
  if (
    completedUser?.hasSetPassword === false &&
    completedUser.authProviders?.google?.googleId
  ) {
    throw new Error(googleOnlySignInMessage);
  }

  const onboardingUser = await User.findOne({ email }).lean();
  if (
    onboardingUser?.hasSetPassword === false &&
    onboardingUser.authProviders?.google?.googleId
  ) {
    throw new Error(googleOnlySignInMessage);
  }

  const auth = await authenticateUser(payload);
  await CompletedUser.findOneAndUpdate(
    { email: payload.email },
    { $set: mobileMetaPatch(mobileMeta) }
  );
  return auth;
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
    await revokeAllRefreshTokensForEmail(email);
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


