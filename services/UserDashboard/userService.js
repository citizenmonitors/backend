import path from "path";
import CompletedUser from "../../models/CompletedUser.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import ElectionData from "../../models/Election/ElectionData.js";
import Election from "../../models/Election/Election.js";
import bcrypt from "bcryptjs";
import moment from "moment";
import { sendEmail } from "../../config/email.js";
import User from "../../models/User.js";
import fs from "fs";
import profileImageModel from "../../models/UserProfileImage/ProfileImageModel.js";
import { fileURLToPath } from "url";
import observerIdModel from "../../models/observerIds/observerIdModel.js";
import { emailChangeNotificationTemplate, emailVerificationCodeTemplate, resendVerificationCodeTemplate } from "../../config/emailTemplates.js";
import { uploadFileToFirebase } from "../../config/firebaseUploader.js";
import bucket from "../../config/firebaseConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_URL = process.env.BACKEND_URL;

export const volunteerToObserverService = async ({ email, details, files }) => {
  const user = await CompletedUser.findOne({ email });

  if (!user) {
    throw new Error("No account found with this email address");
  }
  if (user.role == "observer") {
    throw new Error("You are already an observer.");
  }
  // console.log(files);

  // Check if at least one observer ID file is provided
  if (!files || !files["observerId"] || files["observerId"].length === 0) {
    throw new Error("At least one observer ID file is required for observers.");
  }


  // Check if an observer already exists in the user's polling unit
  const existingObserver = await CompletedUser.findOne({
    pollingUnit: user.pollingUnit,
    isObserverInPollingUnit: true,
  });

  if (existingObserver) {
    throw new Error("An observer already exists in your polling unit.");
  }

  // Check for ongoing elections
  const ongoingElections = await Election.find({
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (ongoingElections.length > 0) {
    // Check if the user has already submitted results or incidents for ongoing elections
    const hasSubmittedResults = await ElectionData.findOne({
      user: user._id,
      election: { $in: ongoingElections.map((election) => election._id) },
    });

    const hasSubmittedIncidents = await IncidentReport.findOne({
      user: user._id,
      election: { $in: ongoingElections.map((election) => election._id) },
    });

    if (hasSubmittedResults || hasSubmittedIncidents) {
      throw new Error(
        "You cannot change your role to observer because you have already submitted results or incidents for ongoing elections."
      );
    }
  }

  // Check if today is an election day
  const isElectionDay = ongoingElections.some((election) => {
    const today = new Date().toDateString();
    const electionDay = election.startDate.toDateString();
    return today === electionDay;
  });

  if (isElectionDay) {
    throw new Error("You cannot change your role to observer on election day.");
  }

  // Process the observer ID files (one or more files)
  const observerIdFiles = await Promise.all(
    files["observerId"].map(async (file) => {
      const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "observer_ids");
      const observerIdFile = await observerIdModel.create({
        location: filePath,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: publicUrl,
      });
      return observerIdFile;
    })
  );

  details.observerId = observerIdFiles;

  // Set isObserverInPollingUnit to false and pendingObserverVerification to true
  details.isObserverInPollingUnit = false;
  details.pendingObserverVerification = true;

  // Update the user details and change role to "observer"
  Object.assign(user, details);
  user.role = "observer";

  // Save the updated user to the database
  await user.save();

  // Exclude the password from the response
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
    // Find the user by ID
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
      delete updateData.confirmPassword;
    }

    // Handle profile image update
    let profileImageFile;
    if (file && file.profileImage) {
      if (user.profileImage && user.profileImage.location) {
        const location = user.profileImage.location;
    
        if (location.startsWith("profile_images/")) {
          // Delete from Firebase
          const oldFile = bucket.file(location);
          const [exists] = await oldFile.exists();
    
          if (exists) {
            await oldFile.delete();
            console.log("Deleted old profile image from Firebase:", location);
          } else {
            console.log("Old profile image not found in Firebase:", location);
          }
        } else {
          // Delete from local storage
          const oldImagePath = path.join(__dirname, "../../", location);
          if (fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
              if (err) {
                console.error("Error deleting local profile image:", err);
              } else {
                console.log("Deleted old local profile image:", oldImagePath);
              }
            });
          } else {
            console.log("Old local profile image not found:", oldImagePath);
          }
        }
      }
    
      // Upload new profile image to Firebase
      const { publicUrl, filePath, token } = await uploadFileToFirebase(file.profileImage, "profile_images");
    
      // Save new profile image metadata to DB
      profileImageFile = await profileImageModel.create({
        location: filePath,
        name: file.profileImage.originalname,
        type: file.profileImage.mimetype,
        size: file.profileImage.size,
        url: publicUrl,
        token,
      });
    
      // Attach to updateData
      updateData.profileImage = profileImageFile;
    }
    

        // Handle notifications update
        if (updateData.notifications) {
          const { inbox, election, newsletter } = updateData.notifications;
    
          if (inbox !== undefined) user.notifications.email.inbox = inbox;
          if (election !== undefined) user.notifications.email.election = election;
          if (newsletter !== undefined) user.notifications.email.newsletter = newsletter;
        }

    // Check for ongoing elections using moment.js
    const ongoingElections = await Election.find({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    // Observers cannot change coverage details, downgrade if attempted
    const coverageFields = [
      "state",
      "lga",
      "ward",
      "pollingUnit",
      "isRegisteredVoter",
      "isPoliticalPartyMember",
      "isElectionWitnessReady",
      "isOpenToSurvey",
    ];

    const isChangingCoverageDetails = coverageFields.some((field) =>
      Object.keys(updateData).includes(field)
    );

    if (user.role === "observer" && isChangingCoverageDetails) {
      const today = moment();

      // Prevent changes if the current date is within any election period
      const isWithinOngoingElection = ongoingElections.some((election) => {
        const electionStart = moment(election.startDate);
        const electionEnd = moment(election.endDate);
        return today.isBetween(electionStart, electionEnd, "day", "[]");
      });

      if (isWithinOngoingElection) {
        throw new Error(
          "Observers cannot update coverage details during ongoing elections. Please try again later."
        );
      }

      // Check if the observer has submitted results for any ongoing election
      const hasSubmittedResults = await ElectionData.findOne({
        user: user._id,
        election: { $in: ongoingElections.map((election) => election._id) },
      });

      if (hasSubmittedResults) {
        throw new Error(
          "Observers cannot change coverage details after submitting results for an ongoing election."
        );
      }

      // Downgrade observer to volunteer if they attempt to change coverage details
      updateData.role = "volunteer";
      updateData.isObserverInPollingUnit = false;
      updateData.pendingObserverVerification = false;
      updateData.coverageUpdateCount = 0; // Reset count upon downgrade
      console.log(
        "Observer downgraded to volunteer for changing coverage details."
      );
    } else if (user.role === "volunteer" && isChangingCoverageDetails) {
      // Allow volunteers to change coverage details only three times
      if (user.coverageUpdateCount >= 3) {
        throw new Error(
          "You have reached the maximum limit of 3 coverage updates."
        );
      }
      updateData.coverageUpdateCount = user.coverageUpdateCount + 1;
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

    // Exclude observer-specific and sensitive details if the role is downgraded to volunteer
    let userDetails = updatedUser.toObject();
    if (userDetails.role === "volunteer") {
      const fieldsToExclude = [
        "observerId",
        "isObserverInPollingUnit",
        "pendingObserverVerification",
        "phoneNumber",
        "bankName",
        "bankAccountNumber",
        "bankAccountName",
      ];
      fieldsToExclude.forEach((field) => delete userDetails[field]);
    }

    // Exclude the password from the response
    delete userDetails.password;

    // Return the updated user details
    return userDetails;
  } catch (error) {
    throw new Error(`Error updating user details: ${error.message}`);
  }
};

export const updateUserEmail = async (userId, newEmail) => {
  try {
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found. Please make sure you are logged in.");
    }

    if (newEmail === user.email) {
      throw new Error(
        "The new email address cannot be the same as your current email address."
      );
    }

  
    // Check if the new email is already in use
    const emailExistsInCompletedUser = await CompletedUser.findOne({
      email: newEmail,
    });
    const emailExistsInUser = await User.findOne({ email: newEmail });

    if (emailExistsInCompletedUser || emailExistsInUser) {
      throw new Error(
        "The new email address is already in use by another account. Please use a different email address."
      );
    }

    // Generate a verification code and set expiration time
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = moment().add(10, "minutes").toDate();
    user.pendingEmail = newEmail; // Store the new email temporarily

    const currentEmailContent = emailChangeNotificationTemplate(newEmail);
  
    // Send notification to the current email
    await sendEmail({
      from: process.env.ZEPTO_FROM_EMAIL,
      to: user.email,
      subject: "Email Change Request - Citizen Monitors",
      htmlbody: currentEmailContent,
    });


    const newEmailContent = emailVerificationCodeTemplate(verificationCode);
    // Send verification code to the new email
    await sendEmail({
      from: process.env.SZEPTO_FROM_EMAIL,
      to: newEmail,
      subject: "Verify Your New Email Address - Citizen Monitors",
      htmlbody: newEmailContent,
    });

    await user.save();

    return {
      message:
        "A verification code has been sent to your new email address. Please check your email and follow the instructions to confirm the change.",
    };
  } catch (error) {
    throw new Error(`Error processing email update: ${error.message}`);
  }
};

export const verifyUserEmail = async (userId, verificationCode) => {
  try {
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found. Please make sure you are logged in.");
    }

    // Check if the verification code is correct and not expired
    if (user.verificationCode !== verificationCode) {
      throw new Error(
        "The verification code you entered is incorrect. Please check your email and try again."
      );
    }

    if (moment().isAfter(user.verificationCodeExpires)) {
      throw new Error(
        "The verification code has expired. Please request a new code."
      );
    }

    // Check if the new email is still not in use
    const emailExistsInCompletedUser = await CompletedUser.findOne({
      email: user.pendingEmail,
    });
    const emailExistsInUser = await User.findOne({ email: user.pendingEmail });

    if (emailExistsInCompletedUser || emailExistsInUser) {
      throw new Error(
        "The new email address is already in use by another account. Please use a different email address."
      );
    }

    // Update the user's email
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    return { message: "Your email address has been successfully updated." };
  } catch (error) {
    throw new Error(
      `Error verifying code and updating email: ${error.message}`
    );
  }
};

export const resendTokenService = async (userId) => {
  try {
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found. Please make sure you are logged in.");
    }

    if (!user.pendingEmail) {
      throw new Error(
        "There is no pending email change request. Please initiate an email update first."
      );
    }


    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = moment().add(10, "minutes").toDate();
    await user.save();


    const htmlContent = resendVerificationCodeTemplate(verificationCode);
    // Resend verification code to the new email
    await sendEmail({
      from: process.env.ZEPTO_FROM_EMAIL,
      to: user.pendingEmail,
      subject: "Resend Verification Code - Citizen Monitors",
      htmlbody: htmlContent,
    });

    return {
      message:
        "A new verification code has been sent to your pending email address. Please check your email and follow the instructions to verify your email.",
    };
  } catch (error) {
    throw new Error(`Error resending verification code: ${error.message}`);
  }
};

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
