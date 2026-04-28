import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.ts";
import { uploadPulsePostFiles } from "../../config/electionMulter.ts";
import {
  getPulsePostCommentsMobile,
  getPulsePostsMobile,
  postPulseCommentLikeMobile,
  postPulsePostCommentMobile,
  postPulsePostLikeMobile,
  postPulsePostMobile,
} from "../../controllers/mobile/pulseController.ts";

const router = express.Router();

router.get("/posts", authMiddleware, getPulsePostsMobile);
router.post(
  "/posts",
  authMiddleware,
  (req, res, next) => {
    uploadPulsePostFiles(req, res, (err?: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(400).json({
          message: "Pulse image upload error",
          error: message,
        });
      }
      next();
    });
  },
  postPulsePostMobile
);
router.post("/posts/:postId/like", authMiddleware, postPulsePostLikeMobile);
router.get("/posts/:postId/comments", authMiddleware, getPulsePostCommentsMobile);
router.post("/posts/:postId/comments", authMiddleware, postPulsePostCommentMobile);
router.post(
  "/posts/:postId/comments/:commentId/like",
  authMiddleware,
  postPulseCommentLikeMobile
);

export default router;
