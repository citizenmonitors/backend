import express from 'express';
import { getStates, getLGAs, getWards, getPollingUnits } from '../../controllers/Location/locationController.ts';

const router = express.Router();

// Endpoint to get all states
router.get("/states", getStates);

// Endpoint to get LGAs for a specific state
router.get("/states/:state/local_governments", getLGAs);

// Endpoint to get wards for a specific LGA
router.get("/states/:state/local_governments/*/wards", getWards);

// Endpoint to get polling units for a specific ward with nested directories
router.get("/states/:state/local_governments/*/wards/*/polling_units", getPollingUnits);

export default router;

