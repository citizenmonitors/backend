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
  uploadCollationDiscussionFiles,
  uploadReportDataFiles,
  uploadResultDataFiles,
} from "../../config/electionMulter.ts";
import {
  getMobileCollation,
  postMobileCollationUserAction,
  getReportThreadCommentsMobile,
  postReportThreadCommentMobile,
  postReportCommentLikeMobile,
  getDiscussionPostsMobile,
  postDiscussionPostMobile,
  postDiscussionPostLikeMobile,
  getDiscussionPostCommentsMobile,
  postDiscussionPostCommentMobile,
  postDiscussionPostCommentLikeMobile,
} from "../../controllers/mobile/collationController.ts";

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
  postMobileCollationUserAction
);

// Threaded comments on a specific result (election-result) or incident (incident-report)
router.get(
  "/:activeElectionId/report-thread/:targetType/:targetId/comments",
  authMiddleware,
  getReportThreadCommentsMobile
);
router.post(
  "/:activeElectionId/report-thread/:targetType/:targetId/comments",
  authMiddleware,
  postReportThreadCommentMobile
);
router.post(
  "/:activeElectionId/report-thread/comments/:commentId/like",
  authMiddleware,
  postReportCommentLikeMobile
);

// Election-level discussion feed (Figma "Discussions" tab)
router.get(
  "/:activeElectionId/discussion/posts",
  authMiddleware,
  getDiscussionPostsMobile
);
router.post(
  "/:activeElectionId/discussion/posts",
  authMiddleware,
  (req, res, next) => {
    uploadCollationDiscussionFiles(req, res, (err?: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(400).json({
          message: "Discussion media upload error",
          error: message,
        });
      }
      next();
    });
  },
  postDiscussionPostMobile
);
router.post(
  "/:activeElectionId/discussion/posts/:postId/like",
  authMiddleware,
  postDiscussionPostLikeMobile
);
router.get(
  "/:activeElectionId/discussion/posts/:postId/comments",
  authMiddleware,
  getDiscussionPostCommentsMobile
);
router.post(
  "/:activeElectionId/discussion/posts/:postId/comments",
  authMiddleware,
  postDiscussionPostCommentMobile
);
router.post(
  "/:activeElectionId/discussion/posts/:postId/comments/:commentId/like",
  authMiddleware,
  postDiscussionPostCommentLikeMobile
);

export default router;
