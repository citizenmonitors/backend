import { getData } from "../../services/Location/locationService.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, "../../data/states");

const getAllData = (req, res) => {
  try {
    const data = getData(baseDir);
    res.json(data);
  } catch (error) {
    console.error(`Error getting data: ${error.message}`);
    res.status(500).send("Error reading data");
  }
};

const getStates = (req, res) => {
  try {
    const data = getData(baseDir);
    res.json(data.states.map((state) => ({ id: state.id, name: state.name })));
  } catch (error) {
    console.error(`Error getting states: ${error.message}`);
    res.status(500).send("Error reading state data");
  }
};

const getLocalGovernmentsByState = (req, res) => {
  try {
    const { stateName } = req.params;
    const data = getData(baseDir);
    const state = data.states.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase()
    );
    if (state) {
      res.json(state.local_governments);
    } else {
      res.status(404).send("State not found");
    }
  } catch (error) {
    console.error(`Error getting local governments: ${error.message}`);
    res.status(500).send("Error reading data");
  }
};

const getWardsByLocalGovernment = (req, res) => {
  try {
    const { stateName, lgaName } = req.params;
    const data = getData(baseDir);
    const state = data.states.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase()
    );
    if (state) {
      const lga = state.local_governments.find(
        (l) => l.name.toLowerCase() === lgaName.toLowerCase()
      );
      if (lga) {
        res.json(lga.wards);
      } else {
        res.status(404).send("Local government not found");
      }
    } else {
      res.status(404).send("State not found");
    }
  } catch (error) {
    console.error(`Error getting wards: ${error.message}`);
    res.status(500).send("Error reading data");
  }
};

const getPollingUnitsByWard = (req, res) => {
  try {
    const { stateName, lgaName, wardName } = req.params;
    const data = getData(baseDir);
    const state = data.states.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase()
    );
    if (state) {
      const lga = state.local_governments.find(
        (l) => l.name.toLowerCase() === lgaName.toLowerCase()
      );
      if (lga) {
        const ward = lga.wards.find(
          (w) => w.name.toLowerCase() === wardName.toLowerCase()
        );
        if (ward) {
          res.json(ward.polling_units);
        } else {
          res.status(404).send("Ward not found");
        }
      } else {
        res.status(404).send("Local government not found");
      }
    } else {
      res.status(404).send("State not found");
    }
  } catch (error) {
    console.error(`Error getting polling units: ${error.message}`);
    res.status(500).send("Error reading data");
  }
};

export {
  getAllData,
  getStates,
  getLocalGovernmentsByState,
  getWardsByLocalGovernment,
  getPollingUnitsByWard,
};