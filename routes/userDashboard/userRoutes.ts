import express from "express";
import {
  volunteerToObserver,
  updateUser,
  deleteUser,
  verifyEmail,
  resendToken,
  updateUserEmailCon,
} from "../../controllers/UserDashboard/userController.ts";
import { publicViewerToVolunteerMobile } from "../../controllers/mobile/profileController.ts";
import { authMiddleware } from "../../middleware/authMiddleware.ts";

const router = express.Router();

router.put("/volunteer-to-observer", authMiddleware, volunteerToObserver);
router.put(
  "/public-viewer-to-volunteer",
  authMiddleware,
  publicViewerToVolunteerMobile
);

// Update user details
router.put("/user", authMiddleware, updateUser);
router.put("/user/update-email", authMiddleware, updateUserEmailCon)
router.post("/user/verify-email", authMiddleware, verifyEmail)
router.post("/user/resend-token", authMiddleware, resendToken)

// Delete user account
router.delete("/user", authMiddleware, deleteUser);
export default router;
