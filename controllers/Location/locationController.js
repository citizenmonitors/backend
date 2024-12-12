import path from "path";
import {
  getData,
  buildLocalGovernments,
  buildWards,
  buildPollingUnits,
  findDirectoryWithPrefix,
  resolveNestedDirectories,
} from "../../services/Location/locationService.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.baseDir = path.join(__dirname, "../../data/states");

// Function to normalize names (e.g., replace spaces with hyphens)
const normalizeName = (name) => name.trim().toLowerCase().replace(/\s+/g, "-");

// Helper function to transform response
const transformResponse = (data) => data.map((item) => ({ name: item }));

// Endpoint to get all states
const getStates = (req, res) => {
  try {
    const data = getData(global.baseDir);
    res.json(transformResponse(data.states));
  } catch (error) {
    console.error(`Error getting states: ${error.message}`);
    res.status(500).send("Error getting states");
  }
};

// Endpoint to get LGAs for a specific state
const getLGAs = (req, res) => {
  const state = normalizeName(decodeURIComponent(req.params.state));
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

// Endpoint to get wards for a specific LGA
const getWards = (req, res) => {
  const state = normalizeName(decodeURIComponent(req.params.state));
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
    .map(normalizeName);
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

// Endpoint to get polling units for a specific ward with nested directories
const getPollingUnits = (req, res) => {
  const state = normalizeName(decodeURIComponent(req.params.state));
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
    .map(normalizeName);
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
    .map(normalizeName);

  try {
    const pollingUnits = buildPollingUnits(lgaDir, wardParts);
    res.json(transformResponse(pollingUnits));
  } catch (error) {
    console.error(`Error getting polling units: ${error.message}`);
    res.status(500).send("Error getting polling units");
  }
};

export { getStates, getLGAs, getWards, getPollingUnits };
