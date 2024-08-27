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

export const volunteerToObserver = [
  upload.single("governmentId"), 
  async (req, res) => {
    try {
      const user = req.user;
      const { ...details } = req.body;
      const file = req.file; 

      if (!file) {
        return res
          .status(400)
          .json({ message: "Government ID is required to be an observer" });
      }

      const updatedUser = await volunteerToObserverService({
        email: user.email,
        details,
        file, 
      });

      res.status(200).json({
        message: "Volunteer updated to Observer successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Error updating user to Observer:", err);
      res.status(500).json({
        message: "An error occurred while updating user to Observer",
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
      return res.status(400).json({ message: "New email address is required" });
    }

    const result = await updateUserEmail(userId, newEmail);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error updating email",
      error: error.message,
    });
  }
};

// Send verification email
export const verifyEmail = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the user is authenticated
    const { verificationCode, newEmail } = req.body;

    if (!verificationCode || !newEmail) {
      return res
        .status(400)
        .json({
          message: "Verification code and new email address are required",
        });
    }

    const result = await verifyEmailCodeAndUpdateService(
      userId,
      verificationCode,
      newEmail
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error verifying code",
      error: error.message,
    });
  }
};

// Resend verification token
export const resendToken = async (req, res) => {
  try {
    const { email } = req.body;
    await resendTokenService(email);
    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
