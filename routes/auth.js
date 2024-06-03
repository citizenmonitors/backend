import express from "express";
import {
  register,
  verifyCode,
  selectRole,
  submitRoleForm,
  signIn,
  forgotPassword,
  resetPassword,
  updateUserDetails,
  getAllUsersController,
  getUsersByRoleController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-code", verifyCode);
router.post("/select-role", selectRole);
router.post("/submit-role-form", submitRoleForm);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/update-user", updateUserDetails);
router.get("/users", getAllUsersController);
router.get("/users/:role", getUsersByRoleController);

export default router;
