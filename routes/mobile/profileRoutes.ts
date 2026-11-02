import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.ts";
import { handleValidationErrors } from "../../validators/authValidators.ts";
import {
  deleteUser,
  resendToken,
  updateUserEmailCon,
  verifyEmail,
} from "../../controllers/UserDashboard/userController.ts";
import {
  getElectionVaultMobile,
  generateAnonymousUsernameMobile,
  getMyProfileMobile,
  getNotificationSettingsMobile,
  locatePollingUnitMobile,
  publicViewerToVolunteerMobile,
  submitFeedbackMobile,
  setAnonymousIdentityToggleMobile,
  upsertObserverDataMobile,
  updateMyPasswordMobile,
  updateMyProfileMobile,
  updateNotificationSettingsMobile,
  volunteerToObserverMobile,
} from "../../controllers/mobile/profileController.ts";
import { deletePushToken, postPushToken } from "../../controllers/mobile/pushTokenController.ts";
import {
  mobileFeedbackValidation,
  mobileAnonymousIdentityToggleValidation,
  mobileNotificationUpdateValidation,
  mobileObserverDataValidation,
  mobilePollingUnitLookupValidation,
  mobileUpdatePasswordValidation,
  profileEmailUpdateValidation,
  profileVerifyEmailValidation,
} from "../../validators/mobile/profileValidators.ts";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfileMobile);
router.put("/me", authMiddleware, ...updateMyProfileMobile);
router.put(
  "/me/password",
  authMiddleware,
  mobileUpdatePasswordValidation,
  handleValidationErrors,
  updateMyPasswordMobile
);

router.put(
  "/me/email",
  authMiddleware,
  profileEmailUpdateValidation,
  handleValidationErrors,
  updateUserEmailCon
);
router.post(
  "/me/email/verify",
  authMiddleware,
  profileVerifyEmailValidation,
  handleValidationErrors,
  verifyEmail
);
router.post("/me/email/resend", authMiddleware, resendToken);
router.delete("/me", authMiddleware, deleteUser);

router.put(
  "/upgrade/volunteer-to-observer",
  authMiddleware,
  ...volunteerToObserverMobile
);
router.put(
  "/observer-data",
  authMiddleware,
  mobileObserverDataValidation,
  handleValidationErrors,
  ...upsertObserverDataMobile
);
router.put(
  "/upgrade/public-viewer-to-volunteer",
  authMiddleware,
  publicViewerToVolunteerMobile
);
router.post(
  "/me/anonymous-username/generate",
  authMiddleware,
  generateAnonymousUsernameMobile
);
router.put(
  "/me/anonymous-identity",
  authMiddleware,
  mobileAnonymousIdentityToggleValidation,
  handleValidationErrors,
  setAnonymousIdentityToggleMobile
);

router.get("/election-vault", authMiddleware, getElectionVaultMobile);
router.post(
  "/polling-unit/lookup",
  authMiddleware,
  mobilePollingUnitLookupValidation,
  handleValidationErrors,
  locatePollingUnitMobile
);

// Device push token: save on login / app start, remove on logout.
router.post("/push-token", authMiddleware, postPushToken);
router.delete("/push-token", authMiddleware, deletePushToken);

router.get("/notifications", authMiddleware, getNotificationSettingsMobile);
router.put(
  "/notifications",
  authMiddleware,
  mobileNotificationUpdateValidation,
  handleValidationErrors,
  updateNotificationSettingsMobile
);

router.post(
  "/feedback",
  authMiddleware,
  mobileFeedbackValidation,
  handleValidationErrors,
  submitFeedbackMobile
);

export default router;
