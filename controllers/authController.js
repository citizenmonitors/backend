import {
  registerUser,
  verifyUserEmail,
  resendTokenService,
  selectUserRole,
  submitRoleFormDetails,
  authenticateUser,
  generateResetToken,
  resetUserPassword,
  validateTokenService,
  submitObserverDetails,
} from "../services/authService.js";
import upload from "../config/multer.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      message:
        "Registration successful! Please check your email for the verification code."
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const result = await verifyUserEmail(req.body.email, req.body.verificationCode);
    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resendToken = async (req, res) => {
  try {
    const { email } = req.body;
    await resendTokenService(email);
    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const pickRole = async (req, res) => {
  try {
    const { email, role } = req.body;

    const result = await selectUserRole(email, role);

    const respone = {
      message: result.message,
    };

    if (result.token){
      respone.token = result.token
    }

    if (result.user){
      respone.user = result.user;
    }

    res.status(200).json(respone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const submitRoleForm = [
  upload.single("profileImage"), 
  async (req, res) => {
    try {
      const { email, ...details } = req.body;
      const file = req.file; 

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Call the service with the email, details, and the file
      const { user, isObserverInPollingUnit } =
        await submitRoleFormDetails({
          email,
          details,
          file, 
        });

      // Send response
      res.status(200).json({
        message:
          "Details submitted successfully. You can now select your role.",
        user,
        isObserverInPollingUnit,
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
];



export const submitObserverDetailsController = [
  upload.fields([
    { name: "observerId[]", maxCount: 2 }, 
  ]),
  async (req, res) => {
    try {
      const {
        email,
        phoneNumber,
        bankName,
        bankAccountNumber,
        bankAccountName,
        token,
      } = req.body;

      // Collect the two observer ID files (PVC front and back)
      const observerIdFiles = req.files["observerId[]"];


      // Call the service and pass the observerIdFiles
      const result = await submitObserverDetails({
        email,
        observerIdFiles,
        phoneNumber,
        bankName,
        bankAccountNumber,
        bankAccountName,
      });

      // Send response
      return res.status(200).json({
        message: result.message,
        token: result.token,
        user: result.user,
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
];


export const signIn = async (req, res) => {
  try {
    const { token, user } = await authenticateUser(req.body);
    res.status(200).json({
      token,
      user,
      message: "Login successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await generateResetToken(req.body.email);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await resetUserPassword(req.body.token, req.body.password);
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const validateUserSession = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    const user = await validateTokenService(token);
    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};




