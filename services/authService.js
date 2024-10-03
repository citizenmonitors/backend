import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import CompletedUser from "../models/CompletedUser.js";
import DailyTraffic from "../models/DailyTraffic/dailyTraffic.js";
import monthlyActiveUsers from "../models/ActiveMontlyUsers/activeMontlyUsers.js";
import transporter from "../config/email.js";
import { generateToken } from "../utils/generateToken.js";
import { hashPassword } from "../utils/hashPassword.js";
import moment from "moment";
import path from "path";
import ProfileImageModel from "../models/UserProfileImage/ProfileImageModel.js";
import observerIdModel from "../models/observerIds/observerIdModel.js";
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
  user.verificationCodeExpires = moment().add(10, "minutes").toDate();

  await user.save();

  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `<p>Your verification code is: ${verificationCode}</p>`,
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

  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `<p>Your verification code is: ${verificationCode}</p>`,
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
    const profileImagePath = `/profileimage/${path.basename(file.path)}`;

    // Create the profileImage object
    const profileImageFile = await ProfileImageModel.create({
      location: profileImagePath,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: `${BACKEND_URL}${profileImagePath}`,
    });

    // console.log("Profile image saved:", profileImageFile); 

    details.profileImage = profileImageFile; 
  } else {
    // Handle the case where no profile image is provided
    // console.log("No profile image provided or invalid format.");
  }

  // Assign general details to the user
  Object.assign(user, details);
  user.isVerified = true;

  // Save the user with updated details
  await user.save();

  // console.log("User details after saving:", user); 

  // Generate a token for the user after the form submission
  const token = generateToken({ email: user.email });

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
    token,
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
  }

  // Ensure the user has selected the observer role
  if (user.role !== "observer") {
    throw new Error("User is not an observer.");
  }

  // Validate the required details
  if (!phoneNumber || !bankName || !bankAccountNumber || !bankAccountName) {
    throw new Error(
      "Please provide all the required details: phone number, bank name, bank account number, and bank account name."
    );
  }

  // Ensure that two files are provided (PVC front and back)
  if (!observerIdFiles || observerIdFiles.length !== 2) {
    throw new Error("Both PVC front and back are required for observers.");
  }

  // Handle observer ID uploads (saving both PVC front and back)
  const observerId = await Promise.all(
    observerIdFiles.map(async (file) => {
      const observerIdPath = `/observerid/${path.basename(file.path)}`;

      const createdFile = await observerIdModel.create({
        location: observerIdPath,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: `${process.env.BACKEND_URL}${observerIdPath}`,
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

  // Return the user details, excluding the password
  const { password, ...userDetails } = completedUser.toObject();

  return {
    message:
      "Observer details submitted successfully, pending admin verification.",
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

  // Update daily login count
  const today = moment().startOf("day").format("DD MM YYYY");
  let dailyTraffic = await DailyTraffic.findOne({ date: today });

  if (!dailyTraffic) {
    dailyTraffic = new DailyTraffic({ date: today, loginCount: 0, users: [] });
  }

  if (!dailyTraffic.users) {
    dailyTraffic.users = [];
  }

  if (!dailyTraffic.users.includes(user._id)) {
    dailyTraffic.loginCount += 1;
    dailyTraffic.users.push(user._id);
    await dailyTraffic.save();
  }

  // update monthly active users

  const currentMonth = moment().subtract(1, "month").format("MM YYYY");
  let monthlyActive = await monthlyActiveUsers.findOne({ month: currentMonth });

  if (!monthlyActive) {
    monthlyActive = new monthlyActiveUsers({
      month: currentMonth,
      activeUserCount: 0,
      users: [],
    });
  }

  if (!monthlyActive.users.includes(user._id)) {
    monthlyActive.activeUserCount += 1;
    monthlyActive.users.push(user._id);
    await monthlyActive.save();
  }

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

  await transporter.sendMail({
    to: email,
    subject: "Password Reset",
    html: `<p>You requested a password reset</p><p>Click this <a href="${resetUrl}">link</a> to reset your password</p>`,
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

  // const currentTime = moment();
  // const tokenExpirationTime = moment(user.resetPasswordExpires);

  // if (currentTime.isAfter(tokenExpirationTime)) {
  //   throw new Error("Token has expired");
  // }

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
