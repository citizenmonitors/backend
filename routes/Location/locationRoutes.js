import express from "express";
import {
  getAllData,
  getStates,
  getLocalGovernmentsByState,
  getWardsByLocalGovernment,
  getPollingUnitsByWard,
} from "../../controllers/Location/locationController.js";

const router = express.Router();

router.get("/data", getAllData);
router.get("/states", getStates);
router.get("/states/:stateName/local_governments", getLocalGovernmentsByState);
router.get(
  "/states/:stateName/local_governments/:lgaName/wards",
  getWardsByLocalGovernment
);
router.get(
  "/states/:stateName/local_governments/:lgaName/wards/:wardName/polling_units",
  getPollingUnitsByWard
);

export default router;

