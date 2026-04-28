import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const asParamString = (value) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
const statesData = JSON.parse(readFileSync(path.join(__dirname, "../state-data/state.json"), "utf-8"));
const statesLocalGovsData = JSON.parse(readFileSync(path.join(__dirname, "../state-data/lga.json"), "utf-8"));
const statesLocalGovsWardsData = JSON.parse(readFileSync(path.join(__dirname, "../state-data/wards.json"), "utf-8"));
const statesLocalGovsWardsPollingUnitsData = JSON.parse(readFileSync(path.join(__dirname, "../state-data/polling-units.json"), "utf-8"));
const sortByString = (array, _field) => {
    return array.sort((a, b) => {
        const nameA = a ? String(a).toUpperCase() : "";
        const nameB = b ? String(b).toUpperCase() : "";
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });
};
// Endpoint to get all states
router.get("/states", (_req, res) => {
    const sortedStates = sortByString(statesData, "state");
    console.log(`Total number of states: ${sortedStates.length}`);
    res.json(sortedStates);
});
// Endpoint to get local governments by state
router.get("/state/:state", (req, res) => {
    const state = asParamString(req.params.state);
    const stateData = statesLocalGovsData.find((s) => s.state.toLowerCase() === state.toLowerCase());
    if (stateData) {
        const sortedLgas = sortByString(stateData.lgas, "lga");
        res.json(sortedLgas);
    }
    else {
        res.status(404).json({ message: "State not found" });
    }
});
// Endpoint to get wards by state and local government
router.get("/state/:state/lga/:lga", (req, res) => {
    const state = asParamString(req.params.state);
    const lga = asParamString(req.params.lga);
    const stateData = statesLocalGovsWardsData.find((s) => s.state.toLowerCase() === state.toLowerCase());
    if (stateData) {
        const lgaData = stateData.lgas.find((l) => l.lga.toLowerCase() === lga.toLowerCase());
        if (lgaData) {
            const sortedWards = sortByString(lgaData.wards, "ward");
            res.json(sortedWards);
        }
        else {
            res.status(404).json({ message: "Local Government not found" });
        }
    }
    else {
        res.status(404).json({ message: "State not found" });
    }
});
// Endpoint to get polling units by state, local government, and ward
router.get("/state/:state/lga/:lga/ward/:ward", (req, res) => {
    const state = asParamString(req.params.state);
    const lga = asParamString(req.params.lga);
    const ward = asParamString(req.params.ward);
    const stateData = statesLocalGovsWardsPollingUnitsData.find((s) => s.state.toLowerCase() === state.toLowerCase());
    if (stateData) {
        const lgaData = stateData.lgas.find((l) => l.lga.toLowerCase() === lga.toLowerCase());
        if (lgaData) {
            const wardData = lgaData.wards.find((w) => w.ward.toLowerCase() === ward.toLowerCase());
            if (wardData) {
                const sortedPollingUnits = sortByString(wardData.polling_units, "polling_unit");
                res.json(sortedPollingUnits);
            }
            else {
                res.status(404).json({ message: "Ward not found" });
            }
        }
        else {
            res.status(404).json({ message: "Local Government not found" });
        }
    }
    else {
        res.status(404).json({ message: "State not found" });
    }
});
// Endpoint to get all local governments
router.get("/local-governments", (_req, res) => {
    let allLocalGovs = [];
    statesLocalGovsData.forEach((state) => {
        allLocalGovs = allLocalGovs.concat(state.lgas.map((lga) => ({ state: state.state, lga: lga.lga })));
    });
    const sortedLocalGovs = (allLocalGovs);
    console.log("Total number of Local Governments:", sortedLocalGovs.length);
    res.json(sortedLocalGovs);
});
export default router;
router.get("/wards", (_req, res) => {
    let allWards = [];
    statesLocalGovsWardsData.forEach((state) => {
        state.lgas.forEach((lga) => {
            allWards = allWards.concat(lga.wards.map((ward) => ({
                state: state.state,
                lga: lga.lga,
                ward: ward.ward,
            })));
        });
    });
    const sortedWards = (allWards);
    console.log("Total number of Wards:", sortedWards.length);
    res.json("Wards");
});
// Endpoint to get all polling units
router.get("/polling-units", (_req, res) => {
    let allPollingUnits = [];
    statesLocalGovsWardsPollingUnitsData.forEach((state) => {
        state.lgas.forEach((lga) => {
            lga.wards.forEach((ward) => {
                allPollingUnits = allPollingUnits.concat(ward.polling_units.map((pollingUnit) => ({
                    state: state.state,
                    lga: lga.lga,
                    ward: ward.ward,
                    pollingUnit,
                })));
            });
        });
    });
    const sortedPollingUnits = (allPollingUnits);
    console.log("Total number of Polling Units:", sortedPollingUnits.length);
    res.json("Polling units");
});
//# sourceMappingURL=locations.js.map