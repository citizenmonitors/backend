import express from "express";
import {
  getUserElectionDataController,
  deleteElectionResultData,
  createElection,
  updateElection,
  getAllElectionResultsController,
  getElectionResultByIdCont,
  getElectionByIdCont,
  updateResultData,
  uploadIncidentReportData,
  uploadResultData,
  getAllActiveElections,
  updateIncidentReportData,
  deleteIncidentReportData,
  getLiveElectionByIdCont,
  getUserElectionResultsAndReportsCon,
  getResultsAndPerformActionController,
  checkUserStatusForFlagController,
  createActiveElectionsCon,
  updateActiveElectionCon,
  getAllElectionTypes,
} from "../../controllers/Election/electionDataController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  uploadResultDataFiles,
  uploadReportDataFiles,
} from "../../config/electionMulter.js";
import { getActivityBoardAndNotifications, getLiveElectionDetails, getOngoingElections } from "../../controllers/Election/electionLive.js";

const router = express.Router();

// Middleware to log fields
const logFields = (req, res, next) => {
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  req.files.forEach((file) => {
    console.log(
      `File fieldname: ${file.fieldname}, originalname: ${file.originalname}`
    );
  });
  next();
};

router.get("/", authMiddleware, getAllActiveElections);
router.get("/election-types", authMiddleware, getAllElectionTypes);
router.get("/results", authMiddleware, getAllElectionResultsController);
router.get(
  "/election/:electionId/result",
  authMiddleware,
  getElectionResultByIdCont
);
router.get("/election/:electionId", authMiddleware, getElectionByIdCont);
router.get("/live-election/:electionId", authMiddleware, getLiveElectionByIdCont);
router.post("/election", authMiddleware, createElection);
router.put("/election/:electionId", authMiddleware, updateElection);
router.post("/active-elections", authMiddleware, createActiveElectionsCon);
router.put("/active-elections/:electionId", authMiddleware, updateActiveElectionCon);

router.delete(
  "/election/:electionId/results",
  authMiddleware,
  deleteElectionResultData
);

router.get(
  "/user-election-datas",
  authMiddleware,
  getUserElectionDataController
);

router.delete(
  "/election/:electionId/report",
  authMiddleware,
  deleteIncidentReportData
);

// new routes

router.post(
  "/election/:electionId/report",
  authMiddleware,
  (req, res, next) => {
    uploadReportDataFiles(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: "Upload incident data Multer error",
          error: err.message,
        });
      }
      next();
    });
  },
  uploadIncidentReportData
);
router.put(
  "/election/:electionId/report",
  authMiddleware,
  (req, res, next) => {
    uploadReportDataFiles(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: "Update incident data Multer error",
          error: err.message,
        });
      }
      next();
    });
  },
  updateIncidentReportData
);

// Upload result data (single picture)
router.post(
  "/election/:electionId/results",
  authMiddleware,
  (req, res, next) => {
    uploadResultDataFiles(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: "Upload result data Multer error",
          error: err.message,
        });
      }
      next();
    });
  },
  uploadResultData
);
router.put(
  "/election/:electionId/results",
  authMiddleware,
  (req, res, next) => {
    uploadResultDataFiles(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: "Update result data  error",
          error: err.message,
        });
      }
      next();
    });
  },
  updateResultData
);

router.get(
  "/user-election-data",
  authMiddleware,
  getUserElectionResultsAndReportsCon
);
router.post(
  "/user-action",
  authMiddleware,
  getResultsAndPerformActionController);
router.post("/flag-action", authMiddleware, checkUserStatusForFlagController);
router.get("/live-results/:electionId", authMiddleware, getLiveElectionDetails);
router.get("/live-result", authMiddleware, getOngoingElections);
router.get("/activity-board", authMiddleware, getActivityBoardAndNotifications);

export default router;
