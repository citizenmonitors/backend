import {
  getAllUsers,
  getUsersByRole,
  updateUserDetails,
} from "../services/userService.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const users = await getUsersByRole(req.params.role);
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await updateUserDetails(
      req.body.email,
      req.body.updateData
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
