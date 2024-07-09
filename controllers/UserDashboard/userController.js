import {
  observerToVolunteerService,
  updateUserService,
  deleteUserService,
} from "../../services/UserDashboard/userService.js";
import upload from "../../config/multer.js";



// observer to volunteer

export const ObserverToVolunteer = [
  upload.single("governmentId"),
  async (req, res) => {
    try {
      const user = req.user;
      const { ...details } = req.body;
      const file = req.file;

      // if (!email) {
      //   return res.status(400).json({ message: "Email is required" });
      // }

      // if (role === "volunteer") {
      //   return res.status(400).json({ message: "User is a volunteer" });
      // }

      if (!file) {
        return res
          .status(400)
          .json({ message: "Government ID is required to be a volunteer" });
      }

      const updatedUser = await observerToVolunteerService({
        email: user.email,
        details,
        file,
      });

      res.status(200).json({
        message: "Observer updated to volunteer successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Error updating user to volunteer:", err);
      res.status(500).json({
        message: "An error occurred while updating user to volunteer",
      });
    }
  },
];


// Update user details
export const updateUser = async (req, res) => {
 try {
   const userId = req.user._id;
   const { currentPassword, ...updateData } = req.body;

   // Validate new password confirmation if provided
   if (updateData.password && !updateData.confirmPassword) {
     return res
       .status(400)
       .json({ message: "Please confirm your new password" });
   }

   const updatedUser = await updateUserService(
     userId,
     updateData,
     currentPassword
   );
   res.status(200).json(updatedUser);
 } catch (error) {
   res
     .status(500)
     .json({ message: "Error updating user details", error: error.message });
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
