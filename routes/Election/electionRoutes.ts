import express from "express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
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
  deleteElection,
  deleteActiveElection,
} from "../../controllers/Election/electionDataController.ts";
import {
  authMiddleware,
  isAdmin,
  isSuperAdmin,
  isAuthorized,
} from "../../middleware/authMiddleware.ts";
import {
  uploadResultDataFiles,
  uploadReportDataFiles,
} from "../../config/electionMulter.ts";
import { getActivityBoardAndNotifications, getLiveElectionDetails, getOngoingElections } from "../../controllers/Election/electionLive.ts";

const router = express.Router();
const runMulter = (
  middleware: RequestHandler,
  req: Request,
  res: Response,
  next: NextFunction,
  uploadErrorMessage: string
) => {
  middleware(req, res, (err?: unknown) => {
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
router.get(
  "/election/:electionId/result",
  authMiddleware,
  getElectionResultByIdCont
);
router.get("/election/:electionId", authMiddleware, getElectionByIdCont);
router.get("/live-election/:electionId", authMiddleware, getLiveElectionByIdCont);
router.post(
  "/election",
  authMiddleware,
  isAuthorized("createElection"),
  createElection
);
router.put(
  "/election/:electionId",
  authMiddleware,
  isAuthorized("updateElection"),
  updateElection
);
router.post(
  "/active-elections",
  authMiddleware,
  isAuthorized("createActiveElection"),
  createActiveElectionsCon
);
router.put(
  "/active-elections/:electionId",
  authMiddleware,
  isAuthorized("updateActiveElection"),
  updateActiveElectionCon
);

router.delete(
  "/election/:electionId",
  authMiddleware,
  isAuthorized("deleteElection"),
  deleteElection
);
router.delete(
  "/active-election/:activeElectionId",
  authMiddleware,
  isAuthorized("deleteActiveElection"),
  deleteActiveElection
);


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
  (req: Request, res: Response, next: NextFunction) => {
    runMulter(
      uploadReportDataFiles,
      req,
      res,
      next,
      "Upload incident data Multer error"
    );
  },
  uploadIncidentReportData
);
router.put(
  "/election/:electionId/report",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    runMulter(
      uploadReportDataFiles,
      req,
      res,
      next,
      "Update incident data Multer error"
    );
  },
  updateIncidentReportData
);

// Upload result data (single picture)
router.post(
  "/election/:electionId/results",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    runMulter(
      uploadResultDataFiles,
      req,
      res,
      next,
      "Upload result data Multer error"
    );
  },
  uploadResultData
);
router.put(
  "/election/:electionId/results",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    runMulter(
      uploadResultDataFiles,
      req,
      res,
      next,
      "Update result data  error"
    );
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
