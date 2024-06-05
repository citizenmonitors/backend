// services/authService.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import transporter from "../config/email.js";
import { hashPassword } from "../utils/hashPassword.js";
import path from "path";

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

export const registerUser = async ({ email, password, confirmPassword }) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = Date.now() + 3600000; // 1 hour

  const newUser = new User({
    email,
    password: hashedPassword,
    verificationCode,
    isVerified: false,
    verificationCodeExpires,
  });
  await newUser.save();

  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
  });

  return true;
};

export const verifyUserCode = async (email, code) => {
  const user = await User.findOne({ email, verificationCode: code });
  if (!user) {
    throw new Error("Invalid verification code");
  }

  user.verificationCode = null;
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

export const submitRoleFormDetails = async ({ email, role, details, file }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (role === "observer") {
    // Update observer-specific details
    user.firstName = details.firstName;
    user.lastName = details.lastName;
    user.gender = details.gender;
    user.state = details.state;
    user.localGovernment = details.localGovernment;
    user.ward = details.ward;
    user.pollingUnit = details.pollingUnit;
    user.registeredVoter = details.registeredVoter;
    user.politicalParty = details.politicalParty;
    user.electionWitness = details.electionWitness;
    user.politicalSurvey = details.politicalSurvey;
  } else if (role === "volunteer") {
    // Update volunteer-specific details
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png"].includes(ext)) {
        throw new Error("Only image files are allowed");
      }
      user.governmentId = file.path;
    }
    user.phoneNumber = details.phoneNumber;
    user.bankName = details.bankName;
    user.bankAccountNumber = details.bankAccountNumber;
    user.accountName = details.accountName;

    // Update other common details
    user.firstName = details.firstName || user.firstName;
    user.lastName = details.lastName || user.lastName;
    user.gender = details.gender || user.gender;
    user.state = details.state || user.state;
    user.localGovernment = details.localGovernment || user.localGovernment;
    user.ward = details.ward || user.ward;
    user.pollingUnit = details.pollingUnit || user.pollingUnit;
    user.registeredVoter = details.registeredVoter || user.registeredVoter;
    user.politicalParty = details.politicalParty || user.politicalParty;
    user.electionWitness = details.electionWitness || user.electionWitness;
    user.politicalSurvey = details.politicalSurvey || user.politicalSurvey;
  } else {
    throw new Error("Invalid role");
  }

  user.isVerified = true;
  user.formCompletion = true;
  await user.save();
  return user;
};

export const authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or email not verified");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  // Include more user-related information in the JWT payload
  const tokenPayload = {
    email: user.email,
    userId: user._id,
    role: user.role,
    // Add more user-related data as needed
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

  return token;
};

export const generateResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();

  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    to: email,
    subject: "Password Reset",
    html: `
      <p>You requested a password reset</p>
      <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
    `,
  });

  return true;
};

export const resetUserPassword = async (token, newPassword) => {
  const user = await User.findOne({
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

export const updateUserDetailsService = async (email, updateData) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Update any fields provided in the updateData object
  for (const key in updateData) {
    if (key === "password") {
      user[key] = await hashPassword(updateData[key]);
    } else {
      user[key] = updateData[key];
    }
  }

  await user.save();
  return user;
};

export const getAllUsers = async () => {
  return await User.find({});
};

export const getUsersByRole = async (role) => {
  if (!["observer", "volunteer"].includes(role)) {
    throw new Error("Invalid role");
  }
  return await User.find({ role });
};


export const observertovolunteer = async (email, details, file) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("User is not verified");
  }

  // Update user details with volunteer-specific information
  
  user.firstName = details.firstName || user.firstName;
  user.lastName = details.lastName || user.lastName;
  user.gender = details.gender || user.gender;
  user.state = details.state || user.state;
  user.localGovernment = details.localGovernment || user.localGovernment;
  user.ward = details.ward || user.ward;
  user.pollingUnit = details.pollingUnit || user.pollingUnit;
  user.registeredVoter = details.registeredVoter || user.registeredVoter;
  user.politicalParty = details.politicalParty || user.politicalParty;
  user.electionWitness = details.electionWitness || user.electionWitness;
  user.politicalSurvey = details.politicalSurvey || user.politicalSurvey;

  if (file) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      throw new Error("Only image files are allowed");
    }
    user.volunteerDetails.governmentId = file.path;
  }

  user.phoneNumber = details.phoneNumber || user.phoneNumber;
  user.bankName = details.bankName || user.bankName;
  user.bankAccountNumber = details.bankAccountNumber || user.bankAccountNumber;
  user.accountName = details.accountName || user.accountName;

  // Set role to volunteer
  user.role = "volunteer";

  await user.save();
  return user;
};
