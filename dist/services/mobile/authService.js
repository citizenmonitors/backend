import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import CompletedUser from "../../models/CompletedUser.js";
import User from "../../models/User.js";
import { authenticateUser, registerUser, resendTokenService, selectUserRole, submitObserverDetails, submitRoleFormDetails, validateTokenService, verifyUserEmail, } from "../authService.js";
import { sendEmail } from "../../config/email.js";
import { passwordResetOtpTemplate } from "../../config/emailTemplates.js";
import { generateToken } from "../../utils/generateToken.js";
import { hashPassword } from "../../utils/hashPassword.js";
import { verifyJwtEmail } from "../../utils/authToken.js";
const googleOAuthClient = new OAuth2Client();
const getAllowedGoogleClientIds = () => {
    const candidates = [
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
        process.env.GOOGLE_WEB_CLIENT_ID,
        ...(process.env.GOOGLE_CLIENT_IDS?.split(",") ?? []),
        process.env.GOOGLE_CLIENT_ID, // backward compatibility
    ];
    return [...new Set(candidates.map((id) => id?.trim()).filter(Boolean))];
};
const mobileMetaPatch = (mobileMeta) => ({
    ...(mobileMeta?.platform ? { "mobileMeta.platform": mobileMeta.platform } : {}),
    ...(mobileMeta?.deviceId ? { "mobileMeta.deviceId": mobileMeta.deviceId } : {}),
    ...(mobileMeta?.appVersion ? { "mobileMeta.appVersion": mobileMeta.appVersion } : {}),
    ...(mobileMeta?.pushToken ? { "mobileMeta.pushToken": mobileMeta.pushToken } : {}),
    "mobileMeta.lastLoginAt": new Date(),
});
async function verifyGoogleIdToken(idToken) {
    const normalizedToken = idToken.trim().replace(/^Bearer\s+/i, "");
    const allowedAudiences = getAllowedGoogleClientIds();
    let ticket;
    try {
        ticket = await googleOAuthClient.verifyIdToken({
            idToken: normalizedToken,
            ...(allowedAudiences.length > 0 ? { audience: allowedAudiences } : {}),
        });
    }
    catch {
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
export const mobileRegister = async (payload, mobileMeta) => {
    await registerUser(payload);
    await User.findOneAndUpdate({ email: payload.email }, { $set: mobileMetaPatch(mobileMeta) });
};
export const mobileVerifyEmail = async (email, verificationCode) => {
    return verifyUserEmail(email, verificationCode);
};
export const mobileResendToken = async (email) => {
    return resendTokenService(email);
};
export const mobileContinueWithGoogle = async (idToken, mobileMeta) => {
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
        await CompletedUser.updateOne({ email }, {
            $set: {
                ...providerPatch,
                isActive: true,
                lastLogin: new Date(),
            },
        });
        const refreshed = await CompletedUser.findOne({ email });
        const u = refreshed ?? existingCompletedUser;
        const { password, ...user } = u.toObject();
        const token = generateToken({ email });
        return {
            token,
            user,
            requiresPasswordSetup: u.hasSetPassword === false,
            nextStep: "done",
        };
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const needsPlaceholder = !existingUser.password || existingUser.password.length === 0;
        await User.updateOne({ email }, {
            $set: {
                ...providerPatch,
                ...(needsPlaceholder
                    ? {
                        password: await hashPassword(crypto.randomBytes(32).toString("hex")),
                        hasSetPassword: false,
                    }
                    : {}),
            },
        });
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
    const googlePlaceholderPassword = await hashPassword(crypto.randomBytes(32).toString("hex"));
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
export const mobileSetPassword = async (bearerToken, password) => {
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
export const mobileSubmitDetails = async (input) => {
    return submitRoleFormDetails(input);
};
export const mobileSelectRole = async (email, role) => {
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
            message: "Public viewer role selected and completed. You have been registered.",
            token,
            user: userDetails,
            nextStep: "done",
        };
    }
    return selectUserRole(email, role);
};
export const mobileSubmitObserverDetails = async (input) => {
    return submitObserverDetails({
        email: input.email,
        observerIdFiles: input.observerIdFiles,
    });
};
export const mobileSignIn = async (payload, mobileMeta) => {
    const email = payload.email.toLowerCase();
    const googleOnlySignInMessage = "Continue with Google to sign in, or set a password first.";
    const completedUser = await CompletedUser.findOne({ email }).lean();
    if (completedUser?.hasSetPassword === false &&
        completedUser.authProviders?.google?.googleId) {
        throw new Error(googleOnlySignInMessage);
    }
    const onboardingUser = await User.findOne({ email }).lean();
    if (onboardingUser?.hasSetPassword === false &&
        onboardingUser.authProviders?.google?.googleId) {
        throw new Error(googleOnlySignInMessage);
    }
    const { token, user } = await authenticateUser(payload);
    await CompletedUser.findOneAndUpdate({ email: payload.email }, { $set: mobileMetaPatch(mobileMeta) });
    return { token, user };
};
export const mobileForgotPassword = async (email) => {
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const completedUser = await CompletedUser.findOne({ email });
    if (completedUser) {
        completedUser.resetPasswordOTP = otp;
        completedUser.resetPasswordOTPExpires = expiresAt;
        await completedUser.save();
    }
    else {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("No account found with this email address");
        }
        throw new Error("Please complete your registration in the app before resetting your password.");
    }
    await sendEmail({
        to: email,
        subject: "Your Password Reset OTP - Citizen Monitors",
        htmlbody: passwordResetOtpTemplate(otp),
    });
    return { message: "Password reset OTP sent to your email." };
};
export const mobileResendForgotPasswordOtp = async (email) => {
    return mobileForgotPassword(email);
};
export const mobileResetPassword = async (email, otp, password) => {
    const hashed = await hashPassword(password);
    const now = new Date();
    const completedUser = await CompletedUser.findOne({ email });
    if (completedUser) {
        if (completedUser.resetPasswordOTP !== otp) {
            throw new Error("Invalid OTP");
        }
        if (!completedUser.resetPasswordOTPExpires ||
            completedUser.resetPasswordOTPExpires < now) {
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
    throw new Error("Please complete your registration in the app before resetting your password.");
};
export const mobileValidateSession = async (token) => {
    return validateTokenService(token);
};
//# sourceMappingURL=authService.js.map