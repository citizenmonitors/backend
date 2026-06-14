import express from "express";
import type { Request, Response } from "express";
import { readFileSync } from "fs";
import { projectPath } from "../utils/projectRoot.ts";

const router = express.Router();
const asParamString = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";
type StateOnly = { state: string };
type LgaOnly = { lga: string };
type WardOnly = { ward: string };
type PollingUnitWard = { ward: string; polling_units: string[] };
type StateWithLgas = { state: string; lgas: LgaOnly[] };
type StateWithLgaWards = { state: string; lgas: Array<LgaOnly & { wards: WardOnly[] }> };
type StateWithLgaWardsPollingUnits = {
  state: string;
  lgas: Array<LgaOnly & { wards: PollingUnitWard[] }>;
};

const statesData = JSON.parse(
  readFileSync(projectPath("state-data", "state.json"), "utf-8")
) as StateOnly[];
const statesLocalGovsData = JSON.parse(
  readFileSync(projectPath("state-data", "lga.json"), "utf-8")
) as StateWithLgas[];
const statesLocalGovsWardsData = JSON.parse(
  readFileSync(projectPath("state-data", "wards.json"), "utf-8")
) as StateWithLgaWards[];
const statesLocalGovsWardsPollingUnitsData = JSON.parse(
  readFileSync(projectPath("state-data", "polling-units.json"), "utf-8")
) as StateWithLgaWardsPollingUnits[];


const sortByString = (array: unknown[], _field?: string) => {
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

router.get("/states", (_req: Request, res: Response) => {
  const sortedStates = sortByString(statesData, "state");
   console.log(`Total number of states: ${sortedStates.length}`);
  res.json(sortedStates);
});

// Endpoint to get local governments by state
router.get("/state/:state", (req: Request, res: Response) => {
  const state = asParamString(req.params.state);
  const stateData = statesLocalGovsData.find(
    (s) => s.state.toLowerCase() === state.toLowerCase()
  );
  if (stateData) {
    const sortedLgas = sortByString(stateData.lgas, "lga");
    res.json(sortedLgas);
  } else {
    res.status(404).json({ message: "State not found" });
  }
});

// Endpoint to get wards by state and local government
router.get("/state/:state/lga/:lga", (req: Request, res: Response) => {
  const state = asParamString(req.params.state);
  const lga = asParamString(req.params.lga);
  const stateData = statesLocalGovsWardsData.find(
    (s) => s.state.toLowerCase() === state.toLowerCase()
  );
  if (stateData) {
    const lgaData = stateData.lgas.find(
      (l) => l.lga.toLowerCase() === lga.toLowerCase()
    );
    if (lgaData) {
      const sortedWards = sortByString(lgaData.wards, "ward");
      res.json(sortedWards);
    } else {
      res.status(404).json({ message: "Local Government not found" });
    }
  } else {
    res.status(404).json({ message: "State not found" });
  }
});

// Endpoint to get polling units by state, local government, and ward

router.get("/state/:state/lga/:lga/ward/:ward", (req: Request, res: Response) => {
  const state = asParamString(req.params.state);
  const lga = asParamString(req.params.lga);
  const ward = asParamString(req.params.ward);
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
        const sortedPollingUnits = sortByString(
          wardData.polling_units,
          "polling_unit"
        );
        res.json(sortedPollingUnits);
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

// Endpoint to get all local governments
router.get("/local-governments", (_req: Request, res: Response) => {
  let allLocalGovs: Array<{ state: string; lga: string }> = [];
  statesLocalGovsData.forEach((state) => {
    allLocalGovs = allLocalGovs.concat(state.lgas.map((lga) => ({ state: state.state, lga: lga.lga })));
  });
  const sortedLocalGovs = (allLocalGovs);
  console.log("Total number of Local Governments:", sortedLocalGovs.length);
  res.json(sortedLocalGovs);
});

export default router;


router.get("/wards", (_req: Request, res: Response) => {
  let allWards: Array<{ state: string; lga: string; ward: string }> = [];
  statesLocalGovsWardsData.forEach((state) => {
    state.lgas.forEach((lga) => {
      allWards = allWards.concat(
        lga.wards.map((ward) => ({
          state: state.state,
          lga: lga.lga,
          ward: ward.ward,
        }))
      );
    });
  });
  const sortedWards = (allWards);
  console.log("Total number of Wards:", sortedWards.length);
  res.json("Wards");

});

// Endpoint to get all polling units
router.get("/polling-units", (_req: Request, res: Response) => {
  let allPollingUnits: Array<{ state: string; lga: string; ward: string; pollingUnit: string }> = [];
  statesLocalGovsWardsPollingUnitsData.forEach((state) => {
    state.lgas.forEach((lga) => {
      lga.wards.forEach((ward) => {
        allPollingUnits = allPollingUnits.concat(
          ward.polling_units.map((pollingUnit) => ({
            state: state.state,
            lga: lga.lga,
            ward: ward.ward,
            pollingUnit,
          }))
        );
      });
    });
  });
  const sortedPollingUnits = (allPollingUnits);
  console.log("Total number of Polling Units:", sortedPollingUnits.length);
  res.json("Polling units");
});