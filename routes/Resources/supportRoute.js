import express from "express";
import * as SupportController from "../../controllers/Resources/supportContoller.js";
import {
  authMiddleware,
  isAdmin,
  isSuperAdmin,
  isAuthorized,
} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/support", SupportController.createSupport);

router.get("/support", authMiddleware, isAdmin, SupportController.getAllSupports);

router.get("/support/:id", authMiddleware, isAdmin, SupportController.getSupportById);

router.delete("/support/:id", authMiddleware, isAdmin, SupportController.deleteSupport);

export default router;