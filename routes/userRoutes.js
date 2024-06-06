import express from "express";
import {
  getAllUsers,
  getUsersByRole,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/role/:role", getUsersByRole);
router.put("/update", updateUser);

export default router;
