import express from "express";
import { authMiddleware, isAdmin, optionalAuthMiddleware } from "../../middleware/authMiddleware.ts";
import { parseNewsPressAdminMultipart } from "../../config/electionMulter.ts";
import { createPressCoverageAdmin } from "../../controllers/adminController/pressCoverageAdminController.ts";
import {
  getPressCoverageArticleCommentsMobile,
  getPressCoverageBySlugMobile,
  getPressCoverageListMobile,
  postPressCoverageArticleCommentMobile,
  postPressCoverageArticleLikeMobile,
  postPressCoverageCommentLikeMobile,
} from "../../controllers/mobile/pressCoverageController.ts";

const router = express.Router();

router.get("/", optionalAuthMiddleware, getPressCoverageListMobile);
router.post("/", authMiddleware, isAdmin, parseNewsPressAdminMultipart, createPressCoverageAdmin);

router.post("/articles/:articleId/like", authMiddleware, postPressCoverageArticleLikeMobile);
router.get("/articles/:articleId/comments", authMiddleware, getPressCoverageArticleCommentsMobile);
router.post("/articles/:articleId/comments", authMiddleware, postPressCoverageArticleCommentMobile);
router.post(
  "/articles/:articleId/comments/:commentId/like",
  authMiddleware,
  postPressCoverageCommentLikeMobile
);

router.get("/:slug", optionalAuthMiddleware, getPressCoverageBySlugMobile);

export default router;