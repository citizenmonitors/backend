import path from "path";
import CompletedUser from "../../models/CompletedUser.js";
import bcrypt from "bcryptjs";

// bug
// observer to volunteer
export const observerToVolunteerService = async ({ email, details, file }) => {
  const user = await CompletedUser.findOne({ email });

  if (!user) {
    throw new Error("No account found with this email address");
  }

  if (file) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", "pdf", ".png"].includes(ext)) {
      throw new Error(
        "Only images are allowed. Please upload a jpg, jpeg, pdf, or png file."
      );
    }
    details.governmentId = file.path;
  } else {
    throw new Error("Government ID is required for volunteers");
  }

  Object.assign(user, details);
  user.role = "volunteer";

  await user.save();

  const { password, ...userDetails } = user.toObject();
  return userDetails;
};


// Update user details
export const updateUserService = async (userId, updateData, currentPassword) => {
  try {
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If password update is requested
    if (updateData.password) {
      // Verify the current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      // Check if new password and confirm password match
      if (updateData.password !== updateData.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
      delete updateData.confirmPassword;
    }

    const updatedUser = await CompletedUser.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user details: ${error.message}`);
  }
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