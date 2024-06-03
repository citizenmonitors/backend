import {
  registerUser,
  verifyUserEmail,
  submitRoleFormDetails,
  authenticateUser,
  generateResetToken,
  resetUserPassword,
} from "../services/authService.js";
import multer from "../config/multer.js";

// Register User
export const register = async (req, res) => {
  try {
    await registerUser(req.body);
    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    await verifyUserEmail(req.query.token, req.query.role);
    res.redirect(`${process.env.FRONTEND_URL}/step-2?role=${req.query.role}`);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Submit Role Form
export const submitRoleForm = [
  multer.single("governmentId"),
  async (req, res) => {
    try {
      const { email, role } = req.body;
      const details = req.body;
      const file = req.file;
      await submitRoleFormDetails({ email, role, details, file });
      res.status(200).json({ message: "Details submitted successfully." });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
];

// User Sign In
export const signIn = async (req, res) => {
  try {
    const token = await authenticateUser(req.body);
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    await generateResetToken(req.body.email);
    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    await resetUserPassword(req.body.token, req.body.password);
    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
