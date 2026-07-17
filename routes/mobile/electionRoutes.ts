import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.ts";
import {
  getActiveElectionsMobile,
  getMyElectionSubmissionMobile,
  submitElectionResultMobile,
  updateElectionResultMobile,
  deleteElectionResultMobile,
  submitIncidentReportMobile,
  updateIncidentReportMobile,
  deleteIncidentReportMobile,
  getLiveElectionsCarouselMobile,
} from "../../controllers/mobile/electionController.ts";
import {
  uploadReportDataFiles,
  uploadResultDataFiles,
  uploadFlagEvidenceFiles,
} from "../../config/electionMulter.ts";
import {
  getMobileCollation,
  postMobileCollationUserAction,
} from "../../controllers/mobile/collationController.ts";
import collationDiscussionRoutes from "../collationDiscussionRoutes.ts";

const router = express.Router();

// GET /api/v1/mobile/elections/active?status=live|upcoming|concluded&scope=all|polling-unit
router.get("/active", authMiddleware, getActiveElectionsMobile);
router.get("/live-carousel", authMiddleware, getLiveElectionsCarouselMobile);
router.get(
  "/:activeElectionId/my-submission",
  authMiddleware,
  getMyElectionSubmissionMobile
);



// Result + incident CRUD for mobile collation live submissions
router.post(
  "/:activeElectionId/results",
  authMiddleware,
  (req, res, next) => {
    uploadResultDataFiles(req, res, (err?: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(400).json({
          message: "Upload result data Multer error",
          error: message,
        });
      }
      next();
    });
  },
  submitElectionResultMobile
);
router.put(
  "/:activeElectionId/results",
  authMiddleware,
  (req, res, next) => {
    uploadResultDataFiles(req, res, (err?: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(400).json({
          message: "Update result data Multer error",
          error: message,
        });
      }
      next();
    });
  },
  updateElectionResultMobile
);
router.delete(
  "/:activeElectionId/results",
  authMiddleware,
  deleteElectionResultMobile
);

router.post(
  "/:activeElectionId/report",
  authMiddleware,
  (req, res, next) => {
    uploadReportDataFiles(req, res, (err?: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(400).json({
          message: "Upload incident data Multer error",
          error: message,
        });
      }
      next();
    });
  },
  submitIncidentReportMobile
);
router.put(
  "/:activeElectionId/report",
  authMiddleware,
  (req, res, next) => {
    uploadReportDataFiles(req, res, (err?: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(400).json({
          message: "Update incident data Multer error",
          error: message,
        });
      }
      next();
    });
  },
  updateIncidentReportMobile
);
router.delete(
  "/:activeElectionId/report",
  authMiddleware,
  deleteIncidentReportMobile
);

// Collation / election live (active election id = ActiveElection._id)
router.get("/:activeElectionId/collation", authMiddleware, getMobileCollation);
router.post(
  "/:activeElectionId/collation/user-action",
  authMiddleware,
  (req, res, next) => {
    uploadFlagEvidenceFiles(req, res, (err?: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(400).json({
          message: "Flag evidence upload Multer error",
          error: message,
        });
      }
      next();
    });
  },
  postMobileCollationUserAction
);

router.use(collationDiscussionRoutes);

export default router;
