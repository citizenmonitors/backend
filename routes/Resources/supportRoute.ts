import express from "express";
import rateLimit from "express-rate-limit";
import * as SupportController from "../../controllers/Resources/supportContoller.ts";
import {
  authMiddleware,
  isAdmin,
  isSuperAdmin,
  isAuthorized,
} from "../../middleware/authMiddleware.ts";
import { createSupportValidation, handleValidationErrors } from "../../validators/supportValidators.ts";

const router = express.Router();

const supportSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many support requests. Try again later." },
});

router.post("/support", supportSubmitLimiter, createSupportValidation, handleValidationErrors, SupportController.createSupport);

router.get("/support", authMiddleware, isAdmin, SupportController.getAllSupports);

router.get("/support/:id", authMiddleware, isAdmin, SupportController.getSupportById);

router.delete("/support/:id", authMiddleware, isAdmin, SupportController.deleteSupport);

export default router;