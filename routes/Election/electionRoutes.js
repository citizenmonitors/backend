import express from "express";
import {
  uploadElectionData,
  getUserElectionDataController,
  updateUserElectionDataController,
  deleteUserElectionDataController,
  createElectionController,
  getAllElectionResultsController,
  addPoliticalPartyController,
  getPoliticalPartiesController,
  getElectionResultsByTypeAndYearController,
} from "../../controllers/Election/electionDataController.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import upload from "../../config/electionMulter.js";

const router = express.Router();


router.post("/create-election", authMiddleware, createElectionController);
router.post("/add-political-party",
  authMiddleware,
  addPoliticalPartyController
);
router.get("/political-parties", authMiddleware, getPoliticalPartiesController);
router.post(
  "/election/:year/:type/data",
  authMiddleware,
  upload.fields([
    { name: "resultSheets", maxCount: 5 },
    { name: "resultVideos", maxCount: 2 },
  ]),
  uploadElectionData
);
router.get(
  "/election-results",
  authMiddleware,
  getAllElectionResultsController
);
router.get(
  "/election/:type/:year/results",
  authMiddleware,
  getElectionResultsByTypeAndYearController
);

router.get(
  "/user-election-data",
  authMiddleware,
  getUserElectionDataController
);
router.put(
  "/user-election-data/:dataId",
  authMiddleware,
  updateUserElectionDataController
);
router.delete(
  "/user-election-data/:dataId",
  authMiddleware,
  deleteUserElectionDataController
);

export default router;
