import express from "express";
import {
  register,
  verifyEmail,
  resendToken,
  submitRoleForm,
  signIn,
  pickRole,
  validateUserSession,
  forgotPassword,
  resetPassword,
  submitObserverDetailsController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-token", resendToken);
router.post("/select-role", pickRole);
router.post("/submit-details",  submitRoleForm);
router.post("/submit-role", submitObserverDetailsController);
router.post("/signin", signIn);
router.post("/validate", validateUserSession);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
