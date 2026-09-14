import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.ts";
import { uploadPulsePostFiles } from "../../config/electionMulter.ts";
import {
  getPulsePostCommentsPublic,
  getPulsePostsPublic,
  postPulseCommentLikeWeb,
  postPulsePostCommentWeb,
  postPulsePostLikeWeb,
  postPulsePostWeb,
} from "../../controllers/web/pulseController.ts";

const router = express.Router();

/** Public reads — no Bearer auth, no location restriction. */
router.get("/posts", getPulsePostsPublic);
router.get("/posts/:postId/comments", getPulsePostCommentsPublic);

/** Writes require auth. */
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
  postPulsePostWeb
);
router.post("/posts/:postId/like", authMiddleware, postPulsePostLikeWeb);
router.post("/posts/:postId/comments", authMiddleware, postPulsePostCommentWeb);
router.post(
  "/posts/:postId/comments/:commentId/like",
  authMiddleware,
  postPulseCommentLikeWeb
);

export default router;
