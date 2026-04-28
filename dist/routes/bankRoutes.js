import express from "express";
import { getAllBanks } from "../controllers/bankController.js";
const router = express.Router();
router.get("/banks", getAllBanks);
export default router;
//# sourceMappingURL=bankRoutes.js.map