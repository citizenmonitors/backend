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
  getAllElections,
  updateIncidentReportData,
  deleteIncidentReportData,
  getLiveElectionByIdCont,
} from "../../controllers/Election/electionDataController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  uploadResultDataFiles,
  uploadReportDataFiles,
} from "../../config/electionMulter.js";
import { uploadIncidentDataFiles } from "../../config/incidentMulter.js";

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

router.get("/", authMiddleware, getAllElections);
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

router.delete(
  "/election/:electionId/results",
  authMiddleware,
  deleteElectionResultData
);

router.get(
  "/user-election-data",
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

// former routew

// router.post(
//   "/election/:electionId/results",
//   authMiddleware,
//   upload.fields([
//     { name: "resultPictures", maxCount: 9999 },
//     { name: "resultVideos", maxCount: 9999 },
//   ]),
//   uploadResultData
// );
// router.put(
//   "/election/:electionId/results",
//   authMiddleware,
//   upload.fields([
//     { name: "resultPictures", maxCount: 9999 },
//     { name: "resultVideos", maxCount: 9999 },
//   ]),
//   updateResultData
// );

// router.put(
//   "/election/:electionId/report",
//   authMiddleware,
//   uploadIncident,
//   updateIncidentReportData
// );
// router.post(
//   "/election/:electionId/report",
//   authMiddleware,
//   uploadIncident,
//   uploadIncidentReportData
// );

export default router;
