import express from "express";
import { authMiddleware, isAdmin, optionalAuthMiddleware } from "../../middleware/authMiddleware.js";
import { parseNewsPressAdminMultipart } from "../../config/electionMulter.js";
import { createPressCoverageAdmin } from "../../controllers/adminController/pressCoverageAdminController.js";
import { getPressCoverageArticleCommentsMobile, getPressCoverageBySlugMobile, getPressCoverageListMobile, postPressCoverageArticleCommentMobile, postPressCoverageArticleLikeMobile, postPressCoverageCommentLikeMobile, } from "../../controllers/mobile/pressCoverageController.js";
const router = express.Router();
router.get("/", optionalAuthMiddleware, getPressCoverageListMobile);
router.post("/", authMiddleware, isAdmin, parseNewsPressAdminMultipart, createPressCoverageAdmin);
router.post("/articles/:articleId/like", authMiddleware, postPressCoverageArticleLikeMobile);
router.get("/articles/:articleId/comments", authMiddleware, getPressCoverageArticleCommentsMobile);
router.post("/articles/:articleId/comments", authMiddleware, postPressCoverageArticleCommentMobile);
router.post("/articles/:articleId/comments/:commentId/like", authMiddleware, postPressCoverageCommentLikeMobile);
router.get("/:slug", optionalAuthMiddleware, getPressCoverageBySlugMobile);
export default router;
//# sourceMappingURL=pressCoverageRoutes.js.map