import {
  volunteerToObserverService,
  updateUserService,
  verifyUserEmail,
  resendTokenService,
  deleteUserService,
  updateUserEmail,
} from "../../services/UserDashboard/userService.js";
import upload from "../../config/multer.js";



// volunteer to observer

// export const volunteerToObserver = [
//   upload.fields("governmentId"), 
//   async (req, res) => {
//     try {
//       const user = req.user;
//       const { ...details } = req.body;
//       const file = req.file; 

//       if (!files) {
//         return res
//           .status(400)
//           .json({ message: "Government ID is required to be an observer" });
//       }

//       const updatedUser = await volunteerToObserverService({
//         email: user.email,
//         details,
//         files, 
//       });

//       res.status(200).json({
//         message: "Volunteer updated to Observer successfully",
//         user: updatedUser,
//       });
//     } catch (err) {
//       console.error("Error updating user to Observer:", err);
//       res.status(500).json({
//         message: "An error occurred while updating user to Observer",
//       });
//     }
//   },
// ];

export const volunteerToObserver = [
  upload.fields([{ name: "observerId[]", maxCount: 2 }]), // Handle two files for observer ID
  async (req, res) => {
    try {
      const user = req.user;
      const { ...details } = req.body;
      const files = req.files;

      // Check if the correct number of observer ID files are provided
      if (!files || !files.observerId || files.observerId.length !== 2) {
        return res.status(400).json({
          message: "Two observer ID files are required to be an observer",
        });
      }

      // Call the service to update the volunteer to observer
      const updatedUser = await volunteerToObserverService({
        email: user.email,
        details,
        files: files.observerId, // Pass the two observer ID files
      });

      // Return success response
      res.status(200).json({
        message: "Volunteer updated to Observer successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Error updating user to Observer:", err);
      res.status(500).json({
        message: "An error occurred while updating user to Observer",
        error: err.message,
      });
    }
  },
];

// Update user details
export const updateUser = [
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { currentPassword, ...updateData } = req.body;

      // Validate new password confirmation if provided
      if (updateData.password && !updateData.confirmPassword) {
        return res
          .status(400)
          .json({ message: "Please confirm your new password" });
      }

      // Pass the file to the service if there's an uploaded profile image
      const file = req.file ? { profileImage: req.file } : null;

      const result = await updateUserService(
        userId,
        updateData,
        currentPassword,
        file
      );

      if (result.message) {
        return res.status(200).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating user details:", error);
      res.status(500).json({
        message: "Error updating user details",
        error: error.message,
      });
    }
  },
];

export const updateUserEmailCon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res
        .status(400)
        .json({ message: "New email address is required." });
    }

    const result = await updateUserEmail(userId, newEmail);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating email:", error.message);
    res.status(500).json({
      message:
        "There was an error while attempting to update your email. Please try again later.",
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { verificationCode } = req.body; // No need for newEmail since it's stored in the user's pendingEmail field

    if (!verificationCode) {
      return res.status(400).json({
        message:
          "Verification code is required to verify your new email address.",
      });
    }

    const result = await verifyUserEmail(userId, verificationCode);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error verifying email:", error.message);
    res.status(500).json({
      message:
        "There was an error while attempting to verify your email. Please try again later.",
      error: error.message,
    });
  }
};

export const resendToken = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from the authenticated session

    await resendTokenService(userId);

    res
      .status(200)
      .json({
        message:
          "Verification code has been resent to your new email address successfully.",
      });
  } catch (error) {
    console.error("Error resending verification code:", error.message);
    res.status(500).json({
      message:
        "There was an error while attempting to resend the verification code. Please try again later.",
      error: error.message,
    });
  }
};

// Delete user account
export const deleteUser = async (req, res) => {
   try {
     const userId = req.user._id;
     await deleteUserService(userId);
     res.status(200).json({ message: "User account deleted successfully" });
   } catch (error) {
     res
       .status(500)
       .json({ message: "Error deleting user account", error: error.message });
   }
};

