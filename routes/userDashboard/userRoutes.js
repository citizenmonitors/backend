import express from "express";
import {
  ObserverToVolunteer,
  updateUser,
  deleteUser,
  verifyEmail,
  resendToken,
} from "../../controllers/UserDashboard/userController.js";
import {authMiddleware} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.put("/observer-to-volunteer", authMiddleware, ObserverToVolunteer);

// Update user details
router.put("/user", authMiddleware, updateUser);
router.post("/user/verify-email", verifyEmail)
router.post("/user/resend-token", resendToken)

// Delete user account
router.delete("/user", authMiddleware, deleteUser);
export default router;
