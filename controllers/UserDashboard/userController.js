import {
  observerToVolunteerService,
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
