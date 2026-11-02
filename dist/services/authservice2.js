import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import path from "path";
import User from "../models/User.js";
import { sendEmail } from "../config/email.js";
import { hashPassword } from "../utils/hashPassword.js";
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};
export const registerUser = async (payload) => {
    const { email, password, confirmPassword } = payload;
    if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
    }
    const existingUser = (await User.findOne({ email }));
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
    await sendEmail({
        to: email,
        subject: "Verify your email",
        htmlbody: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    });
    return true;
};
export const verifyUserCode = async (email, code) => {
    const user = (await User.findOne({ email, verificationCode: code }));
    if (!user) {
        throw new Error("Invalid verification code");
    }
    user.verificationCode = null;
    await user.save();
    return true;
};
export const selectUserRole = async (email, role) => {
    const user = (await User.findOne({ email }));
    if (!user) {
        throw new Error("User not found");
    }
    user.role = role;
    await user.save();
    return true;
};
export const submitRoleFormDetails = async (payload) => {
    const { email, role, details, file } = payload;
    const user = (await User.findOne({ email }));
    if (!user) {
        throw new Error("User not found");
    }
    if (role === "observer") {
        user.observerDetails = details;
    }
    else if (role === "volunteer") {
        if (file) {
            const ext = path.extname(file.originalname).toLowerCase();
            if (![".jpg", ".jpeg", ".png"].includes(ext)) {
                throw new Error("Only image files are allowed");
            }
            details.governmentId = file.path;
        }
        user.volunteerDetails = details;
    }
    else {
        throw new Error("Invalid role");
    }
    user.isVerified = true;
    user.formCompletion = true;
    await user.save();
    return true;
};
export const authenticateUser = async (payload) => {
    const { email, password } = payload;
    const user = (await User.findOne({ email }));
    if (!user) {
        throw new Error("Invalid email or email not verified");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid password");
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        algorithm: "HS256",
    });
    return token;
};
export const generateResetToken = async (email) => {
    const user = (await User.findOne({ email }));
    if (!user) {
        throw new Error("User not found");
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
        to: email,
        subject: "Password Reset",
        htmlbody: `
      <p>You requested a password reset</p>
      <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
    `,
    });
    return true;
};
export const resetUserPassword = async (token, newPassword) => {
    const user = (await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    }));
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
    const user = (await User.findOne({ email }));
    if (!user) {
        throw new Error("User not found");
    }
    for (const key in updateData) {
        if (key === "password") {
            user[key] = await hashPassword(String(updateData[key] ?? ""));
        }
        else {
            user[key] = updateData[key];
        }
    }
    await user.save();
    return user;
};
export const getAllUsers = async () => {
    return (await User.find({}));
};
export const getUsersByRole = async (role) => {
    if (!["observer", "volunteer"].includes(role)) {
        throw new Error("Invalid role");
    }
    return (await User.find({ role }));
};
//# sourceMappingURL=authservice2.js.map