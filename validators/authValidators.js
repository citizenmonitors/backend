import { body, validationResult } from "express-validator";

/**
 * Middleware: send 400 with validation errors if any
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const firstError = errors.array({ onlyFirstError: true })[0];
  const message = firstError?.msg || "Validation failed";
  return res.status(400).json({ message, errors: errors.array() });
};

// ---- Register ----
export const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
];

// ---- Verify email ----
export const verifyEmailValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("verificationCode")
    .notEmpty()
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits"),
];

// ---- Resend token ----
export const resendTokenValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

// ---- Select role (pickRole) ----
export const pickRoleValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("role")
    .isIn(["observer", "volunteer"])
    .withMessage("Role must be observer or volunteer"),
];

// ---- Sign in ----
export const signInValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ---- Forgot password ----
export const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

// ---- Reset password ----
export const resetPasswordValidation = [
  body("token").notEmpty().trim().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

// ---- Submit details (role form) - email only; other fields validated by service ----
export const submitDetailsValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

// ---- Submit observer details ----
export const submitObserverDetailsValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("phoneNumber").notEmpty().trim().withMessage("Phone number is required"),
];
