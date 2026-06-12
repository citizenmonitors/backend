import express from "express";
import rateLimit from "express-rate-limit";
import * as PvcIssuesController from "../controllers/pvcIssues/pvcIssuesController.js";
import { handleValidationErrors, submitPvcIssueValidation, } from "../validators/pvcIssuesValidators.js";
import { uploadPvcIssuesEvidence } from "../config/pvcIssuesMulter.js";
const router = express.Router();
const submitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many submissions. Please try again later." },
});
router.post("/", submitLimiter, uploadPvcIssuesEvidence, submitPvcIssueValidation, handleValidationErrors, PvcIssuesController.submitReport);
export default router;
//# sourceMappingURL=pvcIssuesRoutes.js.map