import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import CompletedUser from "../models/CompletedUser.js";
import  Traffic  from "../models/DailyTraffic/dailyTraffic.js";
import  ActiveUser  from "../models/ActiveMontlyUsers/activeMontlyUsers.js";
import  { sendEmail } from "../config/email.js";
import { generateToken } from "../utils/generateToken.js";
import { hashPassword } from "../utils/hashPassword.js";
import moment from "moment";
import ProfileImageModel from "../models/UserProfileImage/ProfileImageModel.js";
import observerIdModel from "../models/observerIds/observerIdModel.js";
import { forgotPasswordTemplate, registrationCode, resendCode } from "../config/emailTemplates.js";
import { uploadFileToFirebase } from "../config/firebaseUploader.js";
// import { uploadFileToGCS } from "./GoogleCloud/gcsService.js";

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

// register done 
export const registerUser = async ({ email, password, confirmPassword }) => {
  if (password !== confirmPassword) {
    throw new Error(
      "Passwords do not match. Please make sure you've entered the same password"
    );
  }

  let completedUser = await CompletedUser.findOne({ email });
  if (completedUser) {
    throw new Error("This email is already registered.");
  }

  let user = await User.findOne({ email });
  if (user) {
    // If user exists but is not verified, update the password and verification token
    user.password = await hashPassword(password);
    await user.save();
  } else {
    // If user does not exist, create a new one
    const hashedPassword = await hashPassword(password);

    user = new User({
      email,
      password: hashedPassword,
    });
    await user.save();
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = moment().add(10, "minutes").toDate();

  await user.save();

  const htmlContent = registrationCode(verificationCode);

  await sendEmail({
    from: process.env.ZEPTO_FROM_EMAIL,
    to: email,
    subject: "Welcome to Citizen Monitors - Verify Your Account",
    htmlbody: htmlContent,
  });

  return { message: "Verification code sent to email." };
};

// verify done 
export const verifyUserEmail = async (email, verificationCode) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid account ");
  }

  const completedUser = await CompletedUser.findOne({ email });
  if (completedUser) {
    throw new Error("user already exist account ");
  }

  if (user.verificationCode !== verificationCode) {
    throw new Error("Incorrect verification code");
  }

  // Check if the verification code has expired
  if (moment().isAfter(moment(user.verificationCodeExpires))) {
    throw new Error("Verification code has expired.");
  }

  user.verificationCode = null;
  user.verificationCodeExpires = null;
  user.isVerified = true;
  await user.save();

  return { message: "Email verified successfully." };
};

export const resendTokenService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = moment().add(10, "minutes").toDate();
  await user.save();

  const htmlContent = resendCode(verificationCode);

  await sendEmail({
    from: process.env.ZEPTO_FROM_EMAIL,
    to: email,
    subject: "Resend Verification Code - Citizen Monitors",
    htmlbody: htmlContent,
  });

  return { message: "New verification code sent." };
};


export const submitRoleFormDetails = async ({ email, details, file }) => {
  // Fetch the user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("No account found with this email address");
  }

  if (!user.isVerified) {
    throw new Error("User has not verified their account");
  }

  // Check if an observer already exists in the user's polling unit
  const isObserverInPollingUnit = await CompletedUser.exists({
    pollingUnit: details.pollingUnit,
    isObserverInPollingUnit: true,
  });

  // Handle profile image for the user (only one image, not an array)
  if (file) {
    const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "profile_images");
  
    const profileImageFile = await ProfileImageModel.create({
      location: `profile_images/${file.originalname}`,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: publicUrl,
    });

    console.log("Profile image saved:", profileImageFile); 
  
    details.profileImage = profileImageFile;

  } else {
    // Handle the case where no profile image is provided
  }

  const allowedFields = [
    "firstName", "lastName", "gender", "dateOfBirth", "state", "lga", "ward", "pollingUnit",
    "isRegisteredVoter", "isPoliticalPartyMember", "isElectionWitnessReady", "isOpenToSurvey", "profileImage",
  ];
  const safeDetails = {};
  for (const key of allowedFields) {
    if (details[key] !== undefined) safeDetails[key] = details[key];
  }
  Object.assign(user, safeDetails);
  user.isVerified = true;
  user.hasSubmittedRoleForm = true;

  // Save the user with updated details
  await user.save();

  // console.log("User details after saving:", user); 



  // Destructure the user to exclude the password
  const { password, ...userDetails } = user.toObject();

  // Include the profile image in the response if it exists
  const response = {
    ...userDetails,
    profileImage: userDetails.profileImage || details.profileImage,
  };

  // console.log("Final response:", response); 

  // Return the token, user details, and observer status in the polling unit
  return {
    user: response,
    isObserverInPollingUnit: !!isObserverInPollingUnit,
  };
};
export const selectUserRole = async (email, role) => {
  // Check if the selected role is valid
  if (!["observer", "volunteer"].includes(role)) {
    throw new Error("Invalid role.");
  }

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found.");
  }

  // Check if the user has verified their email
  if (!user.isVerified) {
    throw new Error("User has not verified their email.");
  }

  if (!user.hasSubmittedRoleForm){
    throw new Error(
      "You must submit your details before selecting a role"
    );
  }
    // Set the user's role
    user.role = role;
  await user.save();


  if (role === "volunteer") {
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
      profileImage: user.profileImage,
      pendingObserverVerification: false,
      password: user.password,
    };

    // Save to CompletedUser
    const completedUser = new CompletedUser(completedUserData);
    await completedUser.save();

    // Remove user from the User collection
    await user.deleteOne();

    // Generate a token for the completed user
    const token = generateToken({ email: completedUser.email });

    // Return the completed user details and token
    const { password, ...userDetails } = completedUser.toObject();

    return {
      message:
        "Volunteer role selected and completed. You have been registered.",
      token,
      user: userDetails,
    };
  }

  return {
    message: "Observer role selected. Please fill in additional details.",
  };
};

export const submitObserverDetails = async ({
  email,
  observerIdFiles,
  phoneNumber,
  bankName,
  bankAccountNumber,
  bankAccountName,
}) => {
  // Fetch the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found.");
  };
  // Ensure the user has selected the observer role
  if (user.role !== "observer") {
    throw new Error("User is not an observer.");
  }

  // Validate the required details
  if (!phoneNumber) {
    throw new Error(
      "Please provide your phone number."
    );
  }

  // Ensure that at least one observer ID file is provided
  if (!observerIdFiles || observerIdFiles.length === 0) {
    throw new Error("At least one PVC file is required for observers.");
  }

  // Handle observer ID uploads (saving one or more files)

  const observerId = await Promise.all(
    observerIdFiles.map(async (file) => {
      const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "observer_ids");

      const createdFile = await observerIdModel.create({
        location: filePath,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: publicUrl,
      });

      return createdFile;
    })
  );

  // Prepare the observer details for CompletedUser
  const completedUserData = {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: "observer",
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
    profileImage: user.profileImage,
    observerId, 
    phoneNumber,
    bankName,
    bankAccountNumber,
    bankAccountName,
    password: user.password,
    isObserverInPollingUnit: false,
    pendingObserverVerification: true,
  };

  // Save the CompletedUser
  const completedUser = new CompletedUser(completedUserData);
  await completedUser.save();

  // Remove the original user from the User collection
  await user.deleteOne();

  // Return the user details and token, excluding the password
  const token = generateToken({ email: completedUser.email });
  const { password, ...userDetails } = completedUser.toObject();

  return {
    message:
      "Observer details submitted successfully, pending admin verification.",
      token,
    user: userDetails,
  };
};

export const authenticateUser = async ({ email, password }) => {
  const user = await CompletedUser.findOne({ email });
  if (!user) {
    throw new Error("The email or password you entered is incorrect");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("The password you entered is incorrect");
  }
  user.isActive = true;
  user.lastLogin = new Date();
  await user.save();

  // Update daily traffic
  const today = moment().startOf("day").toDate();
  const traffic = await Traffic.findOneAndUpdate(
    { date: today },
    { $inc: { visitCount: 1 } },
    { upsert: true, new: true }
  );

  // Add user to monthly active users
  const currentMonth = moment().format("YYYY-MM");
  const activeUser = await ActiveUser.findOneAndUpdate(
    { month: currentMonth },
    { $addToSet: { users: user._id } },
    { upsert: true, new: true }
  );

  // Generate JWT token

  const token = generateToken({ email: user.email });
  const { password: userPassword, ...usersDetails } = user.toObject();
  return { token, user: usersDetails };
};

export const generateResetToken = async (email) => {
  const user = await CompletedUser.findOne({ email });
  if (!user) {
    throw new Error("No account found with this email address");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = moment().add(10, "minutes").toDate();
  await user.save();

  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  const htmlContent = forgotPasswordTemplate(resetUrl);

  await sendEmail({
    from: process.env.ZEPTO_FROM_EMAIL,
    to: email,
    subject: "Reset Your Password for Your Citizen Monitors Account",
    htmlbody: htmlContent,
  });

  return { message: "Password reset link sent to email." };
};

export const resetUserPassword = async (token, newPassword) => {
  const user = await CompletedUser.findOne({
    resetPasswordToken: token,
  });
  if (!user) {
    throw new Error("Invalid or expired token");
  }

    if (moment().isAfter(moment(user.resetPasswordExpires))) {
      throw new Error("Token has expired.");
    }

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  return { message: "Password reset successfully." };
};

export const validateTokenService = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const user = await CompletedUser.findOne({ email: decoded.email });
    if (!user) {
      throw new Error("Invalid token");
    }
    const { password, ...usersDetails } = user.toObject();
    return { user: usersDetails };
  } catch (err) {
    throw new Error("Token is not valid or expired");
  }
};

