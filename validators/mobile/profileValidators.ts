import { body } from "express-validator";

export const mobileUpdatePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error("Passwords do not match");
    return true;
  }),
];

export const mobilePublicViewerUpgradeValidation = [];

export const mobileNotificationUpdateValidation = [
  body("pollingUnitActivity").optional().isBoolean(),
  body("electionDayAlert").optional().isBoolean(),
  body("discussionReplies").optional().isBoolean(),
  body("resultAggregated").optional().isBoolean(),
  body("reportConfirmed").optional().isBoolean(),
  body("reportFlagged").optional().isBoolean(),
  body("securityAlerts").optional().isBoolean(),
  body("newsletter").optional().isBoolean(),
  body("newsAndInsights").optional().isBoolean(),
  body("pressCoverage").optional().isBoolean(),
];

export const mobilePollingUnitLookupValidation = [
  body("state").notEmpty().isString().withMessage("state is required"),
  body("lga").notEmpty().isString().withMessage("lga is required"),
  body("ward").optional().isString(),
  body("pollingUnit").optional().isString(),
];

export const mobileFeedbackValidation = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("message")
    .trim()
    .isLength({ min: 5 })
    .withMessage("message must be at least 5 characters"),
];

export const mobileObserverDataValidation = [
  body("phoneNumber").optional().isString(),
  body("bankName").optional().isString(),
  body("bankAccountNumber").optional().isString(),
  body("bankAccountName").optional().isString(),
  body("replaceObserverIds").optional().isBoolean().withMessage("replaceObserverIds must be boolean"),
];

export const mobileAnonymousIdentityToggleValidation = [
  body("enabled")
    .isBoolean()
    .withMessage("enabled must be true or false"),
];

export const profileEmailUpdateValidation = [
  body("newEmail")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage("Valid new email is required"),
];

export const profileVerifyEmailValidation = [
  body("verificationCode")
    .notEmpty()
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits"),
];
