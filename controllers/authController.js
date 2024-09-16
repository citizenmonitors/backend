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
} from "../services/authService.js";
import upload from "../config/multer.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
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
    const user = await selectUserRole(email, role);
    res.status(200).json({ message: "Role selected successfully", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const submitRoleForm = [
  upload.fields([
    { name: "governmentId", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { email, role, ...details } = req.body;
      const files = req.files;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }

      const { token, user } = await submitRoleFormDetails({
        email,
        role,
        details,
        files,
      });

      res.status(200).json({
        message:
          "Details submitted successfully. You can now login to your account.",
        token,
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
];

// export const submitRoleForm = [
//   // Multer middleware to handle file upload
//   upload.fields([
//     { name: "governmentId", maxCount: 1 },
//     { name: "profileImage", maxCount: 1 },
//   ]),

//   async (req, res) => {
//     try {
//       const { email, role, ...details } = req.body;
//       const files = req.files;

//       // Log the files and details for debugging
//       console.log("Files:", files);
//       console.log("Details:", details);

//       // Check if required fields are provided
//       if (!email) {
//         return res.status(400).json({ message: "Email is required" });
//       }

//       if (!role) {
//         return res.status(400).json({ message: "Role is required" });
//       }

//       // Check if governmentId is required for observers
//       if (role === "observer" && (!files || !files.governmentId)) {
//         return res
//           .status(400)
//           .json({ message: "Government ID is required for observers" });
//       }

//       // Call the service function to handle the logic
//       const { token, user } = await submitRoleFormDetails({
//         email,
//         role,
//         details,
//         files,
//       });

//       // Send the response with token and user details
//       res.status(200).json({
//         message:
//           "Details submitted successfully. You can now log in to your account.",
//         token,
//         user,
//       });
//     } catch (err) {
//       console.error("Error during form submission:", err);
//       res.status(400).json({ message: err.message });
//     }
//   },
// ];

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



