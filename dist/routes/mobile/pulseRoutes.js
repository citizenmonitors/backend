import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { uploadPulsePostFiles } from "../../config/electionMulter.js";
import { getPulsePostCommentsMobile, getPulsePostsMobile, postPulseCommentLikeMobile, postPulsePostCommentMobile, postPulsePostLikeMobile, postPulsePostMobile, } from "../../controllers/mobile/pulseController.js";
const router = express.Router();
router.get("/posts", authMiddleware, getPulsePostsMobile);
router.post("/posts", authMiddleware, (req, res, next) => {
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
}, postPulsePostMobile);
router.post("/posts/:postId/like", authMiddleware, postPulsePostLikeMobile);
router.get("/posts/:postId/comments", authMiddleware, getPulsePostCommentsMobile);
router.post("/posts/:postId/comments", authMiddleware, postPulsePostCommentMobile);
router.post("/posts/:postId/comments/:commentId/like", authMiddleware, postPulseCommentLikeMobile);
export default router;
//# sourceMappingURL=pulseRoutes.js.map