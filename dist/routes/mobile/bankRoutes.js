import express from "express";
import { getAllBanks } from "../../controllers/bankController.js";
const router = express.Router();
/** Same payload as web `GET /api/banks` — cached list from `bank-data/banks.json`. */
router.get("/", getAllBanks);
export default router;
//# sourceMappingURL=bankRoutes.js.map