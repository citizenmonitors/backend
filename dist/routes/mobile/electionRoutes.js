import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { getActiveElectionsMobile, getMyElectionSubmissionMobile, submitElectionResultMobile, updateElectionResultMobile, deleteElectionResultMobile, submitIncidentReportMobile, updateIncidentReportMobile, deleteIncidentReportMobile, getLiveElectionsCarouselMobile, getMobileElectionUserAction, postMobileElectionUserAction, } from "../../controllers/mobile/electionController.js";
import { uploadReportDataFiles, uploadResultDataFiles, uploadFlagEvidenceFiles, } from "../../config/electionMulter.js";
import { getMobileCollation } from "../../controllers/mobile/collationController.js";
import { checkUserStatusForFlagController } from "../../controllers/Election/electionDataController.js";
import collationDiscussionRoutes from "../collationDiscussionRoutes.js";
const router = express.Router();
// GET /api/v1/mobile/elections/active?status=live|upcoming|concluded&scope=all|polling-unit
router.get("/active", authMiddleware, getActiveElectionsMobile);
router.get("/live-carousel", authMiddleware, getLiveElectionsCarouselMobile);
// Same as web POST /api/elections/flag-action — check if user can flag (has prior upload)
router.post("/flag-action", authMiddleware, checkUserStatusForFlagController);
router.get("/:activeElectionId/my-submission", authMiddleware, getMyElectionSubmissionMobile);
// Result + incident CRUD for mobile collation live submissions
router.post("/:activeElectionId/results", authMiddleware, (req, res, next) => {
    uploadResultDataFiles(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: "Upload result data Multer error",
                error: message,
            });
        }
        next();
    });
}, submitElectionResultMobile);
router.put("/:activeElectionId/results", authMiddleware, (req, res, next) => {
    uploadResultDataFiles(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: "Update result data Multer error",
                error: message,
            });
        }
        next();
    });
}, updateElectionResultMobile);
router.delete("/:activeElectionId/results", authMiddleware, deleteElectionResultMobile);
router.post("/:activeElectionId/report", authMiddleware, (req, res, next) => {
    uploadReportDataFiles(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: "Upload incident data Multer error",
                error: message,
            });
        }
        next();
    });
}, submitIncidentReportMobile);
router.put("/:activeElectionId/report", authMiddleware, (req, res, next) => {
    uploadReportDataFiles(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: "Update incident data Multer error",
                error: message,
            });
        }
        next();
    });
}, updateIncidentReportMobile);
router.delete("/:activeElectionId/report", authMiddleware, deleteIncidentReportMobile);
// Collation / election live (active election id = ActiveElection._id)
router.get("/:activeElectionId/collation", authMiddleware, getMobileCollation);
// PU verification feed + agree/flag — same rules as web /user-action, scoped to one election
router.get("/:activeElectionId/user-action", authMiddleware, getMobileElectionUserAction);
router.get("/:activeElectionId/collation/user-action", authMiddleware, getMobileElectionUserAction);
router.post("/:activeElectionId/user-action", authMiddleware, (req, res, next) => {
    uploadFlagEvidenceFiles(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: "Flag evidence upload Multer error",
                error: message,
            });
        }
        next();
    });
}, postMobileElectionUserAction);
router.post("/:activeElectionId/collation/user-action", authMiddleware, (req, res, next) => {
    uploadFlagEvidenceFiles(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: "Flag evidence upload Multer error",
                error: message,
            });
        }
        next();
    });
}, postMobileElectionUserAction);
router.use(collationDiscussionRoutes);
export default router;
//# sourceMappingURL=electionRoutes.js.map