import path from "path";
import CompletedUser from "../../models/CompletedUser.js";
import bcrypt from "bcryptjs";
import moment from "moment";
import transporter from "../../config/email.js";
import User from "../../models/User.js";
import fs from "fs";
import profileImageModel from "../../models/UserProfileImage/ProfileImageModel.js";
import { fileURLToPath } from "url";
import governmentIdModel from "../../models/GovernmentIds/GovernmentIdModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_URL = process.env.BACKEND_URL;

// observer to volunteer
export const volunteerToObserverService = async ({ email, details, file }) => {
  const user = await CompletedUser.findOne({ email });

  if (!user) {
    throw new Error("No account found with this email address");
  }

  if (!file) {
    throw new Error("Government ID is required for observers");
  }

  // Process the government ID file
  const governmentIdPath = `/governmentid/${path.basename(file.path)}`;

  // Create a new File entry for government ID
  const governmentIdFile = await governmentIdModel.create({
    location: governmentIdPath,
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
    url: `${BACKEND_URL}${governmentIdPath}`,
  });

  
  details.governmentId = governmentIdFile;

  // Update user details and change role to "observer"
  Object.assign(user, details);
  user.role = "observer";

  // Save the updated user to the database
  await user.save();

  // Exclude password from the response
  const { password, ...userDetails } = user.toObject();
  return userDetails;
};


export const updateUserService = async (
  userId,
  updateData,
  currentPassword,
  file
) => {
  try {
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Handle password update
    if (updateData.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      if (updateData.password !== updateData.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
      delete updateData.confirmPassword; // Clean up the updateData object
    }

    let updatedEmail = false;

    // Handle email update
    if (updateData.email && updateData.email !== user.email) {
      updatedEmail = true;

      const emailExistsInCompletedUser = await CompletedUser.findOne({
        email: updateData.email,
      });
      const emailExistsInUser = await User.findOne({ email: updateData.email });

      if (emailExistsInCompletedUser || emailExistsInUser) {
        throw new Error("This email is already in use.");
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      updateData.verificationCode = verificationCode;
      updateData.verificationCodeExpires = moment().add(10, "minutes").toDate();

      await transporter.sendMail({
        to: updateData.email,
        subject: "Verify your email",
        html: `<p>Your verification code is: ${verificationCode}</p>`,
      });
    }

    // Handle profile image update
    let profileImageFile;
    if (file && file.profileImage) {
      if (user.profileImage && user.profileImage.location) {
        const oldImagePath = path.join(
          __dirname,
          "../../",
          user.profileImage.location
        );
        console.log("Attempting to delete old profile image at:", oldImagePath);

        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Error deleting old profile image:", err);
            } else {
              console.log("Old profile image deleted successfully");
            }
          });
        } else {
          console.log("Old profile image not found:", oldImagePath);
        }
      }
      

      // Save the new profile image
      const profileImagePath = `/profileimage/${path.basename(
        file.profileImage.path
      )}`;
      profileImageFile = await profileImageModel.create({
        location: profileImagePath,
        name: file.profileImage.originalname,
        type: file.profileImage.mimetype,
        size: file.profileImage.size,
        url: `${BACKEND_URL}${profileImagePath}`,
      });

      updateData.profileImage = profileImageFile; // Update with the new image
    }

    // Update user data in the database
    const updatedUser = await CompletedUser.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Return a message if email was updated, else return updated user details
    if (updatedEmail) {
      return { message: "Please verify your new email address" };
    }

    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user details: ${error.message}`);
  }
};

export const updateUserEmail = async (userId, newEmail) => {
 try {
   const user = await CompletedUser.findById(userId);
   if (!user) {
     throw new Error("User not found");
   }

   // Check if the new email is already in use
   const emailExistsInCompletedUser = await CompletedUser.findOne({
     email: newEmail,
   });
   const emailExistsInUser = await User.findOne({ email: newEmail });

   if (emailExistsInCompletedUser || emailExistsInUser) {
     throw new Error("This email is already in use.");
   }

   // Generate verification code and expiration time
   const verificationCode = Math.floor(
     100000 + Math.random() * 900000
   ).toString();

   user.email = newEmail;
   user.verificationCode = verificationCode;
   user.verificationCodeExpires = moment().add(10, "minutes").toDate();

   // Send verification email
   await transporter.sendMail({
     to: newEmail,
     subject: "Verify your new email address",
     html: `<p>Your verification code is: ${verificationCode}</p>`,
   });

   await user.save();

   return {
     message: "Verification code sent. Please verify your new email address.",
   };
 } catch (error) {
   throw new Error(`Error updating email: ${error.message}`);
 }
};

export const verifyUserEmail = async (email, verificationCode) => {
  const user = await CompletedUser.findOne({ email });
  if (!user) {
    throw new Error("Invalid account ");
  }

  if (user.verificationCode !== verificationCode) {
    throw new Error("Wrong verification code");
  }

  const currentTime = moment();
  const codeExpireTime = moment(user.verificationCodeExpires);

  if (currentTime.isAfter(codeExpireTime)) {
    throw new Error("Token has expired");
  }

  user.verificationCode = null;
  user.verificationCodeExpires = null;
  await user.save();

  return true;
};

export const resendTokenService = async (email) => {
  const user = await CompletedUser.findOne({ email });
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

  return true;
};

// Delete user account
export const deleteUserService = async (userId) => {
  try {
    const deletedUser = await CompletedUser.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("User not found");
    }
    return deletedUser;
  } catch (error) {
    throw new Error(`Error deleting user account: ${error.message}`);
  }
};
