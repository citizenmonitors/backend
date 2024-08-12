import express from "express";
import {
  volunteerToObserver,
  updateUser,
  deleteUser,
  verifyEmail,
  resendToken,
} from "../../controllers/UserDashboard/userController.js";
import {authMiddleware} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.put("/volunteer-to-observer", authMiddleware, volunteerToObserver);

// Update user details
router.put("/user", authMiddleware, updateUser);
router.post("/user/verify-email", authMiddleware, verifyEmail)
router.post("/user/resend-token", authMiddleware, resendToken)

// Delete user account
router.delete("/user", authMiddleware, deleteUser);
export default router;
