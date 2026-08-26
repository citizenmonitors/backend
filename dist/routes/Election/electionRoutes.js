import express from "express";
import { getUserElectionDataController, deleteElectionResultData, createElection, updateElection, getAllElectionResultsController, getElectionResultByIdCont, getElectionByIdCont, updateResultData, uploadIncidentReportData, uploadResultData, getAllActiveElections, updateIncidentReportData, deleteIncidentReportData, getLiveElectionByIdCont, getUserElectionResultsAndReportsCon, getResultsAndPerformActionController, checkUserStatusForFlagController, createActiveElectionsCon, updateActiveElectionCon, getAllElectionTypes, deleteElection, deleteActiveElection, } from "../../controllers/Election/electionDataController.js";
import { authMiddleware, isAuthorized, } from "../../middleware/authMiddleware.js";
import { uploadResultDataFiles, uploadReportDataFiles, uploadFlagEvidenceFiles, } from "../../config/electionMulter.js";
import { getActivityBoardAndNotifications, getLiveElectionDetails, getOngoingElections } from "../../controllers/Election/electionLive.js";
import { getMobileCollation } from "../../controllers/mobile/collationController.js";
import { getMyElectionSubmissionMobile, getMobileElectionUserAction, postMobileElectionUserAction, } from "../../controllers/mobile/electionController.js";
import collationDiscussionRoutes from "../collationDiscussionRoutes.js";
const router = express.Router();
const runMulter = (middleware, req, res, next, uploadErrorMessage) => {
    middleware(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: uploadErrorMessage,
                error: message,
            });
        }
        next();
    });
};
router.get("/", authMiddleware, getAllActiveElections);
router.get("/election-types", authMiddleware, getAllElectionTypes);
router.get("/results", authMiddleware, getAllElectionResultsController);
router.get("/election/:electionId/result", authMiddleware, getElectionResultByIdCont);
router.get("/election/:electionId", authMiddleware, getElectionByIdCont);
router.get("/live-election/:electionId", authMiddleware, getLiveElectionByIdCont);
router.post("/election", authMiddleware, isAuthorized("createElection"), createElection);
router.put("/election/:electionId", authMiddleware, isAuthorized("updateElection"), updateElection);
router.post("/active-elections", authMiddleware, isAuthorized("createActiveElection"), createActiveElectionsCon);
router.put("/active-elections/:electionId", authMiddleware, isAuthorized("updateActiveElection"), updateActiveElectionCon);
router.delete("/election/:electionId", authMiddleware, isAuthorized("deleteElection"), deleteElection);
router.delete("/active-election/:activeElectionId", authMiddleware, isAuthorized("deleteActiveElection"), deleteActiveElection);
router.delete("/election/:electionId/results", authMiddleware, deleteElectionResultData);
router.get("/user-election-datas", authMiddleware, getUserElectionDataController);
router.delete("/election/:electionId/report", authMiddleware, deleteIncidentReportData);
// new routes
router.post("/election/:electionId/report", authMiddleware, (req, res, next) => {
    runMulter(uploadReportDataFiles, req, res, next, "Upload incident data Multer error");
}, uploadIncidentReportData);
router.put("/election/:electionId/report", authMiddleware, (req, res, next) => {
    runMulter(uploadReportDataFiles, req, res, next, "Update incident data Multer error");
}, updateIncidentReportData);
// Upload result data (single picture)
router.post("/election/:electionId/results", authMiddleware, (req, res, next) => {
    runMulter(uploadResultDataFiles, req, res, next, "Upload result data Multer error");
}, uploadResultData);
router.put("/election/:electionId/results", authMiddleware, (req, res, next) => {
    runMulter(uploadResultDataFiles, req, res, next, "Update result data  error");
}, updateResultData);
router.get("/user-election-data", authMiddleware, getUserElectionResultsAndReportsCon);
router.post("/user-action", authMiddleware, (req, res, next) => {
    runMulter(uploadFlagEvidenceFiles, req, res, next, "Flag evidence upload Multer error");
}, getResultsAndPerformActionController);
router.post("/flag-action", authMiddleware, checkUserStatusForFlagController);
router.get("/live-results/:electionId", authMiddleware, getLiveElectionDetails);
router.get("/live-result", authMiddleware, getOngoingElections);
router.get("/activity-board", authMiddleware, getActivityBoardAndNotifications);
// Collation + discussion (activeElectionId = ActiveElection._id; same paths as mobile under /elections)
router.get("/:activeElectionId/my-submission", authMiddleware, getMyElectionSubmissionMobile);
router.get("/:activeElectionId/collation", authMiddleware, getMobileCollation);
router.get("/:activeElectionId/user-action", authMiddleware, getMobileElectionUserAction);
router.get("/:activeElectionId/collation/user-action", authMiddleware, getMobileElectionUserAction);
router.post("/:activeElectionId/user-action", authMiddleware, (req, res, next) => {
    runMulter(uploadFlagEvidenceFiles, req, res, next, "Flag evidence upload Multer error");
}, postMobileElectionUserAction);
router.post("/:activeElectionId/collation/user-action", authMiddleware, (req, res, next) => {
    runMulter(uploadFlagEvidenceFiles, req, res, next, "Flag evidence upload Multer error");
}, postMobileElectionUserAction);
router.use(collationDiscussionRoutes);
export default router;
//# sourceMappingURL=electionRoutes.js.map