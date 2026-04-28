import express from "express";
import rateLimit from "express-rate-limit";
import * as SupportController from "../../controllers/Resources/supportContoller.js";
import { authMiddleware, isAdmin, } from "../../middleware/authMiddleware.js";
import { createSupportValidation, handleValidationErrors } from "../../validators/supportValidators.js";
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
//# sourceMappingURL=supportRoute.js.map