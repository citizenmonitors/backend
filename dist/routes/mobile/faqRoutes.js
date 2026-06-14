import express from "express";
import { getCitizenFaqCategoryMobile, getCitizenFaqListMobile, } from "../../controllers/mobile/citizenFaqController.js";
const router = express.Router();
router.get("/", getCitizenFaqListMobile);
router.get("/:category", getCitizenFaqCategoryMobile);
export default router;
//# sourceMappingURL=faqRoutes.js.map