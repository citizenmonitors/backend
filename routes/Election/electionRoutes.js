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
} from "../../controllers/Election/electionDataController.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import upload from "../../config/electionMulter.js";
import uploadIncident from "../../config/incidentMulter.js";

const router = express.Router();


router.get("/", authMiddleware, getAllElections);
router.get(
  "/results",
  authMiddleware,
  getAllElectionResultsController
);
router.get(
  "/election/:electionId/result",
  authMiddleware,
  getElectionResultByIdCont
);
router.get(
  "/election/:electionId",
  authMiddleware,
  getElectionByIdCont
);
router.post("/election", authMiddleware, createElection);
router.put("/election/:electionId", authMiddleware, updateElection);

router.post(
  "/election/:electionId/results",
  authMiddleware,
  upload.fields([
    { name: "resultPictures", maxCount: 9999 },
    { name: "resultVideos", maxCount: 9999 },
  ]),
  uploadResultData
);
router.put(
  "/election/:electionId/results",
  authMiddleware,
  upload.fields([
    { name: "resultPictures", maxCount: 9999 },
    { name: "resultVideos", maxCount: 9999 },
  ]),
  updateResultData
);

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
router.put(
  "/election/:electionId/report",
  authMiddleware,
  uploadIncident.fields([
    { name: "incidentPictures", maxCount: 9999 },
    { name: "incidentVideos", maxCount: 9999 },
  ]),
  updateIncidentReportData
);
router.post(
  "/election/:electionId/report",
  authMiddleware,
  uploadIncident.fields([
    { name: "incidentPictures", maxCount: 9999 },
    { name: "incidentVideos", maxCount: 9999 },
  ]),
  uploadIncidentReportData
);

router.delete(
  "/election/:electionId/results",
  authMiddleware,
  deleteIncidentReportData
);


export default router;
