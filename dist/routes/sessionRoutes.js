import express from "express";
import { validateUserSession } from "../controllers/sessionController.js";
const router = express.Router();
router.post("/validate", validateUserSession);
export default router;
//# sourceMappingURL=sessionRoutes.js.map