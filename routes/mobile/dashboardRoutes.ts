import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.ts";
import { getDashboardMobile } from "../../controllers/mobile/dashboardController.ts";

const router = express.Router();

router.get("/", authMiddleware, getDashboardMobile);

export default router;
