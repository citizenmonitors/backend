import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import CompletedUser from "../models/CompletedUser.js";
import transporter from "../config/email.js";
import { generateToken } from "../utils/generateToken.js";
import { hashPassword } from "../utils/hashPassword.js";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL;

export const registerUser = async ({ email, password, confirmPassword }) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  let completedUser = await CompletedUser.findOne({ email });
  if (completedUser) {
    throw new Error("User already exists in the completed users database.");
  }

  let user = await User.findOne({ email });
  if (user) {
    // If user exists but is not verified, update the password and verification token
    user.password = await hashPassword(password);
    user.verificationToken = generateToken({ email });
    await user.save();
  } else {
    // If user does not exist, create a new one
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateToken({ email });

    user = new User({
      email,
      password: hashedPassword,
      verificationToken,
    });
    await user.save();
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  user.verificationCode = verificationCode;
  await user.save();

  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `<p>Your verification code is: ${verificationCode}</p>`,
  });

  return true;
};

export const verifyUserEmail = async (email, verificationCode) => {
  const user = await User.findOne({ email });
  if (!user || user.verificationCode !== verificationCode) {
    throw new Error("Invalid verification code");
  }

  user.verificationCode = null;
  user.isVerified = true;
  await user.save();

  return true;
};

export const selectUserRole = async (email, role) => {
  if (!["observer", "volunteer"].includes(role)) {
    throw new Error("Invalid role");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();

  return true;
};

// export const submitRoleFormDetails = async ({ email, role, details, file }) => {
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new Error("User not found");
//   }

//   if (file) {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (![".jpg", ".jpeg", ".png"].includes(ext)) {
//       throw new Error("Only image are allowed");
//     }
//     details.governmentId = file.path;
//   }

//   user.role = role;
//   user.details = { ...user.details, ...details };

//   // Move to CompletedUser collection if the form is complete
//   const completedUser = new CompletedUser({
//     email: user.email,
//     password: user.password,
//     role: user.role,
//     details: user.details,
//   });
//   await completedUser.save();
//   await user.deleteOne();

//   return completedUser;
// };

export const submitRoleFormDetails = async ({ email, role, details, file }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (file) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      throw new Error("Only images are allowed");
    }
    details.governmentId = file.path;
  }

  // Update user fields with details
  Object.assign(user, details);
  user.role = role;
  user.isVerified = true; // Mark user as verified if form is complete

  // Move user data to CompletedUser collection
  const completedUserData = {
    role: role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    state: user.state,
    localGovernment: user.localGovernment,
    ward: user.ward,
    pollingUnit: user.pollingUnit,
    isRegisteredVoter: user.isRegisteredVoter,
    isPoliticalPartyMember: user.isPoliticalPartyMember,
    isElectionWitnessReady: user.isElectionWitnessReady,
    isOpenToSurvey: user.isOpenToSurvey,
    governmentId: user.governmentId,
    phoneNumber: user.phoneNumber,
    bankName: user.bankName,
    bankAccountNumber: user.bankAccountNumber,
    bankAccountName: user.bankAccountName,
    password: user.password,
  };

  const completedUser = new CompletedUser(completedUserData);
  await completedUser.save();
  await user.deleteOne();

  const token = generateToken({ email: user.email });
  return { token, completedUser };
};
export const authenticateUser = async ({ email, password }) => {
  const user = await CompletedUser.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or email not verified");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = generateToken({ email: user.email });
  return { token, user };
};

export const generateResetToken = async (email) => {
  const user = await CompletedUser.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();

  const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    to: email,
    subject: "Password Reset",
    html: `<p>You requested a password reset</p><p>Click this <a href="${resetUrl}">link</a> to reset your password</p>`,
  });

  return true;
};

export const resetUserPassword = async (token, newPassword) => {
  const user = await CompletedUser.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Invalid or expired token");
  }

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  return true;
};

export const validateTokenService = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await CompletedUser.findOne({ email: decoded.email });
    if (!user) {
      throw new Error("Invalid token");
    }
    return user;
  } catch (err) {
    throw new Error("Token is not valid or expired");
  }
};
