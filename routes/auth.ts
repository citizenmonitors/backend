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
} from "../controllers/authController.ts";
import {
  continueWithGoogleMobile,
  forgotPasswordMobile,
  resendForgotPasswordOtpMobile,
  resetPasswordMobile,
  setPasswordMobile,
  submitObserverDetailsMobile,
} from "../controllers/mobile/authController.ts";
import {
  handleValidationErrors,
  registerValidation,
  verifyEmailValidation,
  resendTokenValidation,
  pickRoleValidation,
  signInValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  submitDetailsValidation,
  submitObserverDetailsValidation,
} from "../validators/authValidators.ts";
import {
  mobileGoogleContinueValidation,
  mobileResendTokenValidation,
  mobileResetPasswordValidation,
  mobileSetPasswordValidation,
  mobileSubmitObserverDetailsValidation,
} from "../validators/mobile/authValidators.ts";
import upload from "../config/multer.ts";

const router = express.Router();

router.post("/register", registerValidation, handleValidationErrors, register);
router.post("/verify-email", verifyEmailValidation, handleValidationErrors, verifyEmail);
router.post("/resend-token", resendTokenValidation, handleValidationErrors, resendToken);
router.post("/select-role", pickRoleValidation, handleValidationErrors, pickRole);
router.post("/submit-details", upload.single("profileImage"), submitDetailsValidation, handleValidationErrors, submitRoleForm);
router.post("/submit-role", upload.fields([{ name: "observerId[]", maxCount: 2 }]), submitObserverDetailsValidation, handleValidationErrors, submitObserverDetailsController);
router.post("/signin", signInValidation, handleValidationErrors, signIn);
router.post("/validate", validateUserSession);
router.post("/forgot-password", forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.post("/reset-password", resetPasswordValidation, handleValidationErrors, resetPassword);

// Mobile auth flows exposed on web paths (incremental migration)
router.post(
  "/forgot-password/otp",
  mobileResendTokenValidation,
  handleValidationErrors,
  forgotPasswordMobile
);
router.post(
  "/reset-password/otp",
  mobileResetPasswordValidation,
  handleValidationErrors,
  resetPasswordMobile
);
router.post(
  "/google",
  mobileGoogleContinueValidation,
  handleValidationErrors,
  continueWithGoogleMobile
);
router.post(
  "/set-password",
  mobileSetPasswordValidation,
  handleValidationErrors,
  setPasswordMobile
);
router.post(
  "/resend-forgot-password-otp",
  mobileResendTokenValidation,
  handleValidationErrors,
  resendForgotPasswordOtpMobile
);
router.post(
  "/observer-role",
  upload.fields([{ name: "observerId[]", maxCount: 2 }]),
  mobileSubmitObserverDetailsValidation,
  handleValidationErrors,
  submitObserverDetailsMobile
);

export default router;
