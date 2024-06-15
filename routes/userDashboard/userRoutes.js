import express from "express";
import {
  ObserverToVolunteer,
} from "../../controllers/UserDashboard/userController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.put("/observer-to-volunteer", authMiddleware, ObserverToVolunteer);

export default router;
