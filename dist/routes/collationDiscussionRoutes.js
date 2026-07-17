import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadCollationDiscussionFiles } from "../config/electionMulter.js";
import { getReportThreadCommentsMobile, postReportThreadCommentMobile, postReportCommentLikeMobile, getDiscussionPostsMobile, postDiscussionPostMobile, postDiscussionPostLikeMobile, getDiscussionPostCommentsMobile, postDiscussionPostCommentMobile, postDiscussionPostCommentLikeMobile, } from "../controllers/mobile/collationController.js";
const router = express.Router();
// Threaded comments on a specific result (election-result) or incident (incident-report)
router.get("/:activeElectionId/report-thread/:targetType/:targetId/comments", authMiddleware, getReportThreadCommentsMobile);
router.post("/:activeElectionId/report-thread/:targetType/:targetId/comments", authMiddleware, postReportThreadCommentMobile);
router.post("/:activeElectionId/report-thread/comments/:commentId/like", authMiddleware, postReportCommentLikeMobile);
// Election-level discussion feed
router.get("/:activeElectionId/discussion/posts", authMiddleware, getDiscussionPostsMobile);
router.post("/:activeElectionId/discussion/posts", authMiddleware, (req, res, next) => {
    uploadCollationDiscussionFiles(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: "Discussion media upload error",
                error: message,
            });
        }
        next();
    });
}, postDiscussionPostMobile);
router.post("/:activeElectionId/discussion/posts/:postId/like", authMiddleware, postDiscussionPostLikeMobile);
router.get("/:activeElectionId/discussion/posts/:postId/comments", authMiddleware, getDiscussionPostCommentsMobile);
router.post("/:activeElectionId/discussion/posts/:postId/comments", authMiddleware, postDiscussionPostCommentMobile);
router.post("/:activeElectionId/discussion/posts/:postId/comments/:commentId/like", authMiddleware, postDiscussionPostCommentLikeMobile);
export default router;
//# sourceMappingURL=collationDiscussionRoutes.js.map