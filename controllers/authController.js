// controllers/authController.js

import {
  registerUser,
  verifyUserCode,
  selectUserRole,
  submitRoleFormDetails,
  authenticateUser,
  generateResetToken,
  resetUserPassword,
  updateUserDetailsService,
  getAllUsers,
  getUsersByRole,
  observertovolunteer,
} from "../services/authService.js";
import multer from '../config/multer.js';

export const register = async (req, res) => {
  try {
    await registerUser(req.body);
    res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyCode = async (req, res) => {
  try {
    await verifyUserCode(req.body.email, req.body.code);
    res.status(200).json({ message: 'Email verified successfully. Please select your role.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const selectRole = async (req, res) => {
  try {
    await selectUserRole(req.body.email, req.body.role);
    res.status(200).json({ message: 'Role selected successfully. Please complete the form.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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

export const signIn = async (req, res) => {
  try {
    const token = await authenticateUser(req.body);
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await generateResetToken(req.body.email);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await resetUserPassword(req.body.token, req.body.password);
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const { email, updateData } = req.body;
    const user = await updateUserDetailsService(email, updateData);
    res.status(200).json({ message: 'User details updated successfully.', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getUsersByRoleController = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await getUsersByRole(role);
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const submitVolunteerDetails = [ multer.single('governmentId'), async (req, res) => {
  try {
    const email = req.body.email;
    const details = req.body;
    const file = req.file;

    await observertovolunteer(email, details, file);
    res.status(200).json({ message: 'Details submitted successfully. You are now a volunteer.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
},
]