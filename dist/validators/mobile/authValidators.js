import { body } from "express-validator";
export const mobileRegisterValidation = [
    body("email")
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Valid email is required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password)
            throw new Error("Passwords do not match");
        return true;
    }),
    body("platform")
        .optional()
        .isIn(["ios", "android"])
        .withMessage("Platform must be ios or android"),
    body("deviceId").optional().isString(),
    body("appVersion").optional().isString(),
    body("pushToken").optional().isString(),
];
export const mobileSignInValidation = [
    body("email")
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("platform")
        .optional()
        .isIn(["ios", "android"])
        .withMessage("Platform must be ios or android"),
    body("deviceId").optional().isString(),
    body("appVersion").optional().isString(),
    body("pushToken").optional().isString(),
];
export const mobileVerifyEmailValidation = [
    body("email")
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Valid email is required"),
    body("verificationCode")
        .notEmpty()
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage("Verification code must be 6 digits"),
];
export const mobileResendTokenValidation = [
    body("email")
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Valid email is required"),
];
export const mobileGoogleContinueValidation = [
    body("idToken").notEmpty().withMessage("Google idToken is required"),
    body("platform")
        .optional()
        .isIn(["ios", "android"])
        .withMessage("Platform must be ios or android"),
    body("deviceId").optional().isString(),
    body("appVersion").optional().isString(),
    body("pushToken").optional().isString(),
];
export const mobileSetPasswordValidation = [
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password)
            throw new Error("Passwords do not match");
        return true;
    }),
];
export const mobileResetPasswordValidation = [
    body("email")
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Valid email is required"),
    body("otp")
        .notEmpty()
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
];
export const mobileSelectRoleValidation = [
    body("email")
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Valid email is required"),
    body("role")
        .isIn(["observer", "volunteer", "public-viewer"])
        .withMessage("Role must be observer, volunteer or public-viewer"),
];
export const mobileSubmitDetailsValidation = [
    body("email")
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Valid email is required"),
    body("nationality").optional().isString().withMessage("Nationality must be a string"),
    body("whyYouJoinUs").optional().isString().withMessage("whyYouJoinUs must be a string"),
];
export const mobileSubmitObserverDetailsValidation = [
    body("email")
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Valid email is required"),
];
//# sourceMappingURL=authValidators.js.map