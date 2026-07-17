import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { handleValidationErrors } from "../validators/authValidators.ts";
import {
  generateAnonymousUsernameMobile,
  setAnonymousIdentityToggleMobile,
} from "../controllers/mobile/profileController.ts";
import { mobileAnonymousIdentityToggleValidation } from "../validators/mobile/profileValidators.ts";

const router = express.Router();

router.post("/username/generate", authMiddleware, generateAnonymousUsernameMobile);
router.put(
  "/identity",
  authMiddleware,
  mobileAnonymousIdentityToggleValidation,
  handleValidationErrors,
  setAnonymousIdentityToggleMobile
);

export default router;
