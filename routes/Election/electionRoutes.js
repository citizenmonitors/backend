// routes/electionRoutes.js

import express from "express";
import multer from "multer";
import {
  createElectionController,
  getAllElectionsController,
  getOngoingElectionsController,
  getPreviousElectionsController,
  getElectionByTypeAndYearController,
  uploadElectionDataController,
  getUserElectionDataController,
  deleteUserElectionDataController,
  updateUserElectionDataController,
} from "../../controllers/Election/electionController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", authMiddleware, createElectionController);
router.get("/", authMiddleware, getAllElectionsController);
router.get("/ongoing", authMiddleware, getOngoingElectionsController);
router.get("/previous", authMiddleware, getPreviousElectionsController);
router.get("/:type/:year", authMiddleware, getElectionByTypeAndYearController);

router.post(
  "/:type/:year/upload",
  authMiddleware,
  upload.fields([
    { name: "resultSheets", maxCount: 10 },
    { name: "videos", maxCount: 10 },
  ]),
  uploadElectionDataController
);

router.get("/user/data", authMiddleware, getUserElectionDataController);
router.delete(
  "/user/data/:id",
  authMiddleware,
  deleteUserElectionDataController
);
router.put(
  "/user/data/:id",
  authMiddleware,
  upload.fields([
    { name: "resultSheets", maxCount: 10 },
    { name: "videos", maxCount: 10 },
  ]),
  updateUserElectionDataController
);

export default router;
