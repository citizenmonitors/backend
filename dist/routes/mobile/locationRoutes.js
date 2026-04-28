import express from "express";
import { getLGAs, getPollingUnits, getStates, getWards, } from "../../controllers/Location/locationController.js";
const router = express.Router();
// Mobile location endpoints (same logic as web, separate namespace for tracking)
router.get("/states", getStates);
router.get("/states/:state/local_governments", getLGAs);
router.get("/states/:state/local_governments/*/wards", getWards);
router.get("/states/:state/local_governments/*/wards/*/polling_units", getPollingUnits);
export default router;
//# sourceMappingURL=locationRoutes.js.map