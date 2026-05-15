import express from "express";
import { authMiddleware, isAdmin, optionalAuthMiddleware } from "../../middleware/authMiddleware.js";
import { parseNewsPressAdminMultipart } from "../../config/electionMulter.js";
import { createNewsInsightAdmin } from "../../controllers/adminController/newsInsightAdminController.js";
import { getNewsInsightArticleCommentsMobile, getNewsInsightBySlugMobile, getNewsInsightsListMobile, postNewsInsightArticleCommentMobile, postNewsInsightArticleLikeMobile, postNewsInsightCommentLikeMobile, } from "../../controllers/mobile/newsInsightController.js";
const router = express.Router();
router.get("/", optionalAuthMiddleware, getNewsInsightsListMobile);
router.post("/", authMiddleware, isAdmin, parseNewsPressAdminMultipart, createNewsInsightAdmin);
router.post("/articles/:articleId/like", authMiddleware, postNewsInsightArticleLikeMobile);
router.get("/articles/:articleId/comments", authMiddleware, getNewsInsightArticleCommentsMobile);
router.post("/articles/:articleId/comments", authMiddleware, postNewsInsightArticleCommentMobile);
router.post("/articles/:articleId/comments/:commentId/like", authMiddleware, postNewsInsightCommentLikeMobile);
router.get("/:slug", optionalAuthMiddleware, getNewsInsightBySlugMobile);
export default router;
//# sourceMappingURL=newsInsightRoutes.js.map