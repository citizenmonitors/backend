import express from "express";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/authMiddleware.js";
import { uploadPulsePostFiles } from "../../config/electionMulter.js";
import { getPulsePostCommentsPublic, getPulsePostsPublic, postPulseCommentLikeWeb, postPulsePostCommentWeb, postPulsePostLikeWeb, postPulsePostWeb, postPulseRepostWeb, } from "../../controllers/web/pulseController.js";
import { getPulsePostById, patchPulseComment, patchPulsePost, removePulseComment, removePulseCommentLike, removePulsePost, removePulsePostLike, removePulseRepost, } from "../../controllers/shared/pulseManageController.js";
import { deletePulseBlock, getPulseBlocks, postPulseBlock, postPulseCommentReport, postPulsePostReport, } from "../../controllers/shared/pulseSafetyController.js";
const router = express.Router();
const handlePulseUpload = (req, res, next) => {
    uploadPulsePostFiles(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(400).json({
                message: "Pulse image upload error",
                error: message,
            });
        }
        next();
    });
};
/** Public reads — All needs no auth. Location filters use optional Bearer token. */
router.get("/posts", optionalAuthMiddleware, getPulsePostsPublic);
router.get("/posts/:postId/comments", optionalAuthMiddleware, getPulsePostCommentsPublic);
/** Writes require auth. */
router.post("/posts", authMiddleware, handlePulseUpload, postPulsePostWeb);
// No body = plain repost; body (+ optional image) = quote post.
router.post("/posts/:postId/repost", authMiddleware, handlePulseUpload, postPulseRepostWeb);
router.post("/posts/:postId/like", authMiddleware, postPulsePostLikeWeb);
router.post("/posts/:postId/comments", authMiddleware, postPulsePostCommentWeb);
router.post("/posts/:postId/comments/:commentId/like", authMiddleware, postPulseCommentLikeWeb);
/** Edit / delete / unlike / undo repost — auth required. */
router.get("/posts/:postId", optionalAuthMiddleware, getPulsePostById);
router.patch("/posts/:postId", authMiddleware, handlePulseUpload, patchPulsePost);
router.delete("/posts/:postId", authMiddleware, removePulsePost);
router.delete("/posts/:postId/repost", authMiddleware, removePulseRepost);
router.delete("/posts/:postId/like", authMiddleware, removePulsePostLike);
router.patch("/posts/:postId/comments/:commentId", authMiddleware, patchPulseComment);
router.delete("/posts/:postId/comments/:commentId", authMiddleware, removePulseComment);
router.delete("/posts/:postId/comments/:commentId/like", authMiddleware, removePulseCommentLike);
/** Safety: report content and block users — auth required. */
router.post("/posts/:postId/report", authMiddleware, postPulsePostReport);
router.post("/posts/:postId/comments/:commentId/report", authMiddleware, postPulseCommentReport);
router.get("/blocks", authMiddleware, getPulseBlocks);
router.post("/blocks", authMiddleware, postPulseBlock);
router.delete("/blocks/:blockId", authMiddleware, deletePulseBlock);
export default router;
//# sourceMappingURL=pulseRoutes.js.map