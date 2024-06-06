import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const statesData = JSON.parse(
  readFileSync(path.join(__dirname, "../state-data/state.json"), "utf-8")
);
const statesLocalGovsData = JSON.parse(
  readFileSync(path.join(__dirname, "../state-data/lga.json"), "utf-8")
);
const statesLocalGovsWardsData = JSON.parse(
  readFileSync(path.join(__dirname, "../state-data/wards.json"), "utf-8")
);
const statesLocalGovsWardsPollingUnitsData = JSON.parse(
  readFileSync(
    path.join(__dirname, "../state-data/polling-units.json"),
    "utf-8"
  )
);


// Endpoint to get all states
router.get("/states", (req, res) => {
  res.json(statesData);
});

// Endpoint to get local governments by state
router.get("/state/:state", (req, res) => {
  const { state } = req.params;
  const stateData = statesLocalGovsData.find(
    (s) => s.state.toLowerCase() === state.toLowerCase()
  );
  if (stateData) {
    res.json(stateData.lgas);
  } else {
    res.status(404).json({ message: "State not found" });
  }
});

// Endpoint to get wards by state and local government
router.get("/state/:state/lga/:lga", (req, res) => {
  const { state, lga } = req.params;
  const stateData = statesLocalGovsWardsData.find(
    (s) => s.state.toLowerCase() === state.toLowerCase()
  );
  if (stateData) {
    const lgaData = stateData.lgas.find(
      (l) => l.lga.toLowerCase() === lga.toLowerCase()
    );
    if (lgaData) {
      res.json(lgaData.wards);
    } else {
      res.status(404).json({ message: "Local Government not found" });
    }
  } else {
    res.status(404).json({ message: "State not found" });
  }
});

// Endpoint to get polling units by state, local government, and ward
router.get("/state/:state/lga/:lga/ward/:ward", (req, res) => {
  const { state, lga, ward } = req.params;
  const stateData = statesLocalGovsWardsPollingUnitsData.find(
    (s) => s.state.toLowerCase() === state.toLowerCase()
  );
  if (stateData) {
    const lgaData = stateData.lgas.find(
      (l) => l.lga.toLowerCase() === lga.toLowerCase()
    );
    if (lgaData) {
      const wardData = lgaData.wards.find(
        (w) => w.ward.toLowerCase() === ward.toLowerCase()
      );
      if (wardData) {
        res.json(wardData.polling_units);
      } else {
        res.status(404).json({ message: "Ward not found" });
      }
    } else {
      res.status(404).json({ message: "Local Government not found" });
    }
  } else {
    res.status(404).json({ message: "State not found" });
  }
});

export default router;
