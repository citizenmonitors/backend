import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// import fs from "fs";
import path from "path";
import User from "../models/User.js";
import transporter from "../config/email.js";
import { generateToken } from "../utils/generateToken.js";
import { hashPassword } from "../utils/hashPassword.js";
import { body, validationResult } from "express-validator";

const BASE_URL = process.env.BASE_URL;

// Register User
export const registerUser = async ({ email, password, confirmPassword }) => {
  // Input validation
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  const verificationToken = generateToken({ email });

  const newUser = new User({
    email,
    password: hashedPassword,
    verificationToken,
  });
  await newUser.save();

  const observerUrl = `${BASE_URL}/api/auth/verify-email?token=${verificationToken}&role=observer`;
  const volunteerUrl = `${BASE_URL}/api/auth/verify-email?token=${verificationToken}&role=volunteer`;

  try {
    await transporter.sendMail({
      from: "Navalny",
      to: email,
      subject: "Verify your email",
      html: `
      <p>Please verify your email by selecting a role:</p>
      <a href="${observerUrl}">Observer</a>
      <a href="${volunteerUrl}">Volunteer</a>
    `,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }

  return true;
};

// Verify User Email
export const verifyUserEmail = async (token, role) => {
  if (!["observer", "volunteer"].includes(role)) {
    throw new Error("Invalid role");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw new Error("Invalid token");
  }

  user.isVerified = true;
  user.role = role;
  user.verificationToken = null;
  await user.save();

  return true;
};

// Submit Role Form Details
export const submitRoleFormDetails = async ({ email, role, details, file }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (role === "observer") {
    user.observerDetails = details;
  } else if (role === "volunteer") {
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png"].includes(ext)) {
        throw new Error("Only image files are allowed");
      }
      details.governmentId = file.path;
    }
    user.volunteerDetails = details;
  } else {
    throw new Error("Invalid role");
  }

  await user.save();
  return true;
};

// Authenticate User
export const authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !user.isVerified) {
    throw new Error("Invalid email or email not verified");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

// Generate Reset Token
export const generateResetToken = async (email) => {
  const user = await User.findOne({ email });
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
    html: `
      <p>You requested a password reset</p>
      <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
    `,
  });

  return true;
};

// Reset User Password
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

// Validation Middleware
export const validate = (method) => {
  switch (method) {
    case "registerUser": {
      return [
        body("email").isEmail().withMessage("Must be a valid email"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
        body("confirmPassword").custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password");
          }
          return true;
        }),
      ];
    }
    case "authenticateUser": {
      return [
        body("email").isEmail().withMessage("Must be a valid email"),
        body("password").exists().withMessage("Password is required"),
      ];
    }
  }
};
