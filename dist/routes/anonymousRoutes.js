import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { handleValidationErrors } from "../validators/authValidators.js";
import { generateAnonymousUsernameMobile, setAnonymousIdentityToggleMobile, } from "../controllers/mobile/profileController.js";
import { mobileAnonymousIdentityToggleValidation } from "../validators/mobile/profileValidators.js";
const router = express.Router();
router.post("/username/generate", authMiddleware, generateAnonymousUsernameMobile);
router.put("/identity", authMiddleware, mobileAnonymousIdentityToggleValidation, handleValidationErrors, setAnonymousIdentityToggleMobile);
export default router;
//# sourceMappingURL=anonymousRoutes.js.map