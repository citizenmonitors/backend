import { body, validationResult } from "express-validator";
/**
 * Middleware: send 400 with validation errors if any
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        return next();
    const firstError = errors.array({ onlyFirstError: true })[0];
    const message = firstError?.msg || "Validation failed";
    return res.status(400).json({ message, errors: errors.array() });
};
// ---- Register ----
export const registerValidation = [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
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
        .isIn(["web", "ios", "android"])
        .withMessage("Platform must be web, ios or android"),
    body("deviceId").optional().isString(),
    body("appVersion").optional().isString(),
    body("pushToken").optional().isString(),
];
// ---- Verify email ----
export const verifyEmailValidation = [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
    body("verificationCode")
        .notEmpty()
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage("Verification code must be 6 digits"),
];
// ---- Resend token ----
export const resendTokenValidation = [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
];
// ---- Select role (pickRole) ----
export const pickRoleValidation = [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
    body("role")
        .isIn(["observer", "volunteer", "public-viewer"])
        .withMessage("Role must be observer, volunteer or public-viewer"),
];
// ---- Sign in ----
export const signInValidation = [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];
// ---- Forgot password ----
export const forgotPasswordValidation = [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
];
// ---- Reset password ----
export const resetPasswordValidation = [
    body("token").notEmpty().trim().withMessage("Reset token is required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
];
// ---- Submit details (role form) ----
export const submitDetailsValidation = [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
    body("nationality").optional().isString().withMessage("Nationality must be a string"),
    body("whyYouJoinUs").optional().isString().withMessage("whyYouJoinUs must be a string"),
];
// ---- Submit observer details ----
export const submitObserverDetailsValidation = [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
    body("phoneNumber").notEmpty().trim().withMessage("Phone number is required"),
];
export const refreshTokenValidation = [
    body("refreshToken").notEmpty().trim().withMessage("Refresh token is required"),
];
export const logoutValidation = [
    body("refreshToken").notEmpty().trim().withMessage("Refresh token is required"),
];
//# sourceMappingURL=authValidators.js.map