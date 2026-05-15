import express from "express";
import { getCitizenAcademyArticleMobile, getCitizenAcademyListMobile, } from "../../controllers/mobile/citizenAcademyController.js";
const router = express.Router();
router.get("/", getCitizenAcademyListMobile);
router.get("/:slug", getCitizenAcademyArticleMobile);
export default router;
//# sourceMappingURL=academyRoutes.js.map