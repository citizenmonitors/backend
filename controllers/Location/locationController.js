// import { getData } from "../../services/Location/locationService.js";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const baseDir = path.join(__dirname, "../../data/states");

// const getAllData = (req, res) => {
//   try {
//     const data = getData(baseDir);
//     res.json(data);
//   } catch (error) {
//     console.error(`Error getting data: ${error.message}`);
//     res.status(500).send("Error reading data");
//   }
// };

// const getStates = (req, res) => {
//   try {
//     const data = getData(baseDir);
//     res.json(data.states.map((state) => ({ id: state.id, name: state.name })));
//   } catch (error) {
//     console.error(`Error getting states: ${error.message}`);
//     res.status(500).send("Error reading state data");
//   }
// };

// const getLocalGovernmentsByState = (req, res) => {
//   try {
//     const { stateName } = req.params;
//     const data = getData(baseDir);
//     const state = data.states.find(
//       (s) => s.name.toLowerCase() === stateName.toLowerCase()
//     );
//     if (state) {
//       res.json(state.local_governments);
//     } else {
//       res.status(404).send("State not found");
//     }
//   } catch (error) {
//     console.error(`Error getting local governments: ${error.message}`);
//     res.status(500).send("Error reading data");
//   }
// };

// const getWardsByLocalGovernment = (req, res) => {
//   try {
//     const { stateName, lgaName } = req.params;
//     const data = getData(baseDir);
//     const state = data.states.find(
//       (s) => s.name.toLowerCase() === stateName.toLowerCase()
//     );
//     if (state) {
//       const lga = state.local_governments.find(
//         (l) => l.name.toLowerCase() === lgaName.toLowerCase()
//       );
//       if (lga) {
//         res.json(lga.wards);
//       } else {
//         res.status(404).send("Local government not found");
//       }
//     } else {
//       res.status(404).send("State not found");
//     }
//   } catch (error) {
//     console.error(`Error getting wards: ${error.message}`);
//     res.status(500).send("Error reading data");
//   }
// };

// const getPollingUnitsByWard = (req, res) => {
//   try {
//     const { stateName, lgaName, wardName } = req.params;
//     const data = getData(baseDir);
//     const state = data.states.find(
//       (s) => s.name.toLowerCase() === stateName.toLowerCase()
//     );
//     if (state) {
//       const lga = state.local_governments.find(
//         (l) => l.name.toLowerCase() === lgaName.toLowerCase()
//       );
//       if (lga) {
//         const ward = lga.wards.find(
//           (w) => w.name.toLowerCase() === wardName.toLowerCase()
//         );
//         if (ward) {
//           res.json(ward.polling_units);
//         } else {
//           res.status(404).send("Ward not found");
//         }
//       } else {
//         res.status(404).send("Local government not found");
//       }
//     } else {
//       res.status(404).send("State not found");
//     }
//   } catch (error) {
//     console.error(`Error getting polling units: ${error.message}`);
//     res.status(500).send("Error reading data");
//   }
// };

// export {
//   getAllData,
//   getStates,
//   getLocalGovernmentsByState,
//   getWardsByLocalGovernment,
//   getPollingUnitsByWard,
// };

import {
  getData,
  buildLocalGovernments,
  buildWards,
  buildPollingUnits,
  findDirectoryWithPrefix,
  resolveNestedDirectories,
} from "../../services/Location/locationService.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const baseDir = path.join(__dirname, "../../data/states");

global.baseDir = path.join(__dirname, "../../data/states");

const transformResponse = (data) => {
  return data.map((item) => ({ name: item }));
};

export const getStates = (req, res) => {
  try {
    const data = getData();
    res.json(transformResponse(data.states));
  } catch (error) {
    console.error(`Error getting states: ${error.message}`);
    res.status(500).send("Error getting states");
  }
};

export const getLGAs = (req, res) => {
  const state = decodeURIComponent(req.params.state.toLowerCase());
  console.log(`Requested state: ${state}`);
  const stateDirName = findDirectoryWithPrefix(global.baseDir, state);

  if (!stateDirName) {
    console.error(`State directory not found for: ${state}`);
    return res.status(404).send(`State directory not found for: ${state}`);
  }

  const stateDir = path.join(global.baseDir, stateDirName);
  console.log(`Resolved state directory: ${stateDir}`);

  try {
    const localGovernments = buildLocalGovernments(stateDir);
    res.json(transformResponse(localGovernments));
  } catch (error) {
    console.error(`Error getting LGAs: ${error.message}`);
    res.status(500).send("Error getting LGAs");
  }
};

export const getWards = (req, res) => {
  const state = decodeURIComponent(req.params.state.toLowerCase());
  const lgaPath = req.params[0];
  console.log(`Requested state: ${state}, LGA path: ${lgaPath}`);
  const stateDirName = findDirectoryWithPrefix(global.baseDir, state);

  if (!stateDirName) {
    console.error(`State directory not found for: ${state}`);
    return res.status(404).send(`State directory not found for: ${state}`);
  }

  const lgaParts = lgaPath
    .split("/")
    .map(decodeURIComponent)
    .map((part) => part.toLowerCase());
  const lgaDir = resolveNestedDirectories(
    path.join(global.baseDir, stateDirName, "lgas"),
    lgaParts
  );
  if (!lgaDir) {
    console.error(`LGA directory not found for: ${lgaPath}`);
    return res.status(404).send(`LGA directory not found for: ${lgaPath}`);
  }

  console.log(`Resolved LGA directory: ${lgaDir}`);

  try {
    const wards = buildWards(lgaDir);
    res.json(transformResponse(wards));
  } catch (error) {
    console.error(`Error getting wards: ${error.message}`);
    res.status(500).send("Error getting wards");
  }
};

export const getPollingUnits = (req, res) => {
  const state = decodeURIComponent(req.params.state.toLowerCase());
  const lgaPath = req.params[0];
  const wardPath = req.params[1];
  console.log(
    `Requested state: ${state}, LGA path: ${lgaPath}, Ward path: ${wardPath}`
  );
  const stateDirName = findDirectoryWithPrefix(global.baseDir, state);

  if (!stateDirName) {
    console.error(`State directory not found for: ${state}`);
    return res.status(404).send(`State directory not found for: ${state}`);
  }

  const lgaParts = lgaPath
    .split("/")
    .map(decodeURIComponent)
    .map((part) => part.toLowerCase());
  const lgaDir = resolveNestedDirectories(
    path.join(global.baseDir, stateDirName, "lgas"),
    lgaParts
  );
  if (!lgaDir) {
    console.error(`LGA directory not found for: ${lgaPath}`);
    return res.status(404).send(`LGA directory not found for: ${lgaPath}`);
  }

  console.log(`Resolved LGA directory: ${lgaDir}`);

  const wardParts = wardPath
    .split("/")
    .map(decodeURIComponent)
    .map((part) => part.toLowerCase());

  try {
    const pollingUnits = buildPollingUnits(lgaDir, wardParts);
    res.json(transformResponse(pollingUnits));
  } catch (error) {
    console.error(`Error getting polling units: ${error.message}`);
    res.status(500).send("Error getting polling units");
  }
};
