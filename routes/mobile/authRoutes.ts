import express from "express";
import {
  continueWithGoogleMobile,
  forgotPasswordMobile,
  registerMobile,
  resendForgotPasswordOtpMobile,
  resendTokenMobile,
  resetPasswordMobile,
  selectRoleMobile,
  setPasswordMobile,
  signInMobile,
  submitDetailsMobile,
  submitObserverDetailsMobile,
  validateSessionMobile,
  verifyEmailMobile,
} from "../../controllers/mobile/authController.ts";
import upload from "../../config/multer.ts";
import { handleValidationErrors } from "../../validators/authValidators.ts";
import {
  mobileGoogleContinueValidation,
  mobileRegisterValidation,
  mobileResendTokenValidation,
  mobileResetPasswordValidation,
  mobileSelectRoleValidation,
  mobileSetPasswordValidation,
  mobileSignInValidation,
  mobileSubmitDetailsValidation,
  mobileSubmitObserverDetailsValidation,
  mobileVerifyEmailValidation,
} from "../../validators/mobile/authValidators.ts";

const router = express.Router();

router.post("/register", mobileRegisterValidation, handleValidationErrors, registerMobile);
router.post("/verify-email", mobileVerifyEmailValidation, handleValidationErrors, verifyEmailMobile);
router.post("/resend-token", mobileResendTokenValidation, handleValidationErrors, resendTokenMobile);
router.post("/signin", mobileSignInValidation, handleValidationErrors, signInMobile);
router.post("/google/continue", mobileGoogleContinueValidation, handleValidationErrors, continueWithGoogleMobile);
router.post("/set-password", mobileSetPasswordValidation, handleValidationErrors, setPasswordMobile);
router.post("/validate", validateSessionMobile);
router.post("/forgot-password", mobileResendTokenValidation, handleValidationErrors, forgotPasswordMobile);
router.post("/resend-forgot-password-otp", mobileResendTokenValidation, handleValidationErrors, resendForgotPasswordOtpMobile);
router.post("/reset-password", mobileResetPasswordValidation, handleValidationErrors, resetPasswordMobile);
router.post("/select-role", mobileSelectRoleValidation, handleValidationErrors, selectRoleMobile);
router.post("/submit-details", upload.single("profileImage"), mobileSubmitDetailsValidation, handleValidationErrors, submitDetailsMobile);
router.post("/observer-role", upload.fields([{ name: "observerId[]", maxCount: 2 }]), mobileSubmitObserverDetailsValidation, handleValidationErrors, submitObserverDetailsMobile);

export default router;

