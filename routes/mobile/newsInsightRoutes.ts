import express from "express";
import { authMiddleware, isAdmin, optionalAuthMiddleware } from "../../middleware/authMiddleware.ts";
import { parseNewsPressAdminMultipart } from "../../config/electionMulter.ts";
import { createNewsInsightAdmin } from "../../controllers/adminController/newsInsightAdminController.ts";
import {
  getNewsInsightArticleCommentsMobile,
  getNewsInsightBySlugMobile,
  getNewsInsightsListMobile,
  postNewsInsightArticleCommentMobile,
  postNewsInsightArticleLikeMobile,
  postNewsInsightCommentLikeMobile,
} from "../../controllers/mobile/newsInsightController.ts";

const router = express.Router();

router.get("/", optionalAuthMiddleware, getNewsInsightsListMobile);
router.post("/", authMiddleware, isAdmin, parseNewsPressAdminMultipart, createNewsInsightAdmin);

router.post("/articles/:articleId/like", authMiddleware, postNewsInsightArticleLikeMobile);
router.get("/articles/:articleId/comments", authMiddleware, getNewsInsightArticleCommentsMobile);
router.post("/articles/:articleId/comments", authMiddleware, postNewsInsightArticleCommentMobile);
router.post(
  "/articles/:articleId/comments/:commentId/like",
  authMiddleware,
  postNewsInsightCommentLikeMobile
);

router.get("/:slug", optionalAuthMiddleware, getNewsInsightBySlugMobile);

export default router;


