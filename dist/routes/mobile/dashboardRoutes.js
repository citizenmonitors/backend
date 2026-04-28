import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { getDashboardMobile } from "../../controllers/mobile/dashboardController.js";
const router = express.Router();
router.get("/", authMiddleware, getDashboardMobile);
export default router;
//# sourceMappingURL=dashboardRoutes.js.map