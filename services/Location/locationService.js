import fs from "fs";
import path from "path";

// Helper function to read JSON file
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error(
      `Failed to read or parse file at ${filePath}: ${error.message}`
    );
  }
};

// Function to get directory names with numeric prefixes
const getDirectoriesWithPrefix = (baseDir) => {
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
};

// Function to build the polling units data
const buildPollingUnits = (pollingUnitsDir) => {
  const pollingUnits = [];
  if (fs.existsSync(pollingUnitsDir)) {
    const pollingUnitDirs = getDirectoriesWithPrefix(pollingUnitsDir);
    for (const dir of pollingUnitDirs) {
      const fullPath = path.join(pollingUnitsDir, dir, "");
      try {
        const pollingUnitDetails = readJsonFile(
          path.join(fullPath, "index.json")
        );
        pollingUnits.push(...pollingUnitDetails);
      } catch (error) {
        console.error(
          `Error reading polling unit at ${fullPath}: ${error.message}`
        );
      }
    }
  }
  return pollingUnits;
};

// Function to build the wards data
const buildWards = (wardsDir) => {
  const wards = [];
  if (fs.existsSync(wardsDir)) {
    const wardDirs = getDirectoriesWithPrefix(wardsDir);
    for (const dir of wardDirs) {
      const fullPath = path.join(wardsDir, dir);
      try {
        const wardDetails = readJsonFile(path.join(fullPath, "index.json"));
        wards.push({
          ...wardDetails,
          polling_units: buildPollingUnits(fullPath),
        });
      } catch (error) {
        // console.error(`Error reading ward at ${fullPath}: ${error.message}`);
      }
    }
  }
  return wards;
};

// Function to build the local governments data
const buildLocalGovernments = (localGovernmentsDir) => {
  const localGovernments = [];
  if (fs.existsSync(localGovernmentsDir)) {
    const lgaDirs = getDirectoriesWithPrefix(localGovernmentsDir);
    for (const dir of lgaDirs) {
      const fullPath = path.join(localGovernmentsDir, dir);
      try {
        const lgaDetails = readJsonFile(path.join(fullPath, "index.json"));
        localGovernments.push({
          ...lgaDetails,
          wards: buildWards(path.join(fullPath, "wards")),
        });
      } catch (error) {
        // console.error(
        //   `Error reading local government at ${fullPath}: ${error.message}`
        // );
      }
    }
  }
  return localGovernments;
};

// Function to build the states data
const buildStates = (statesDir) => {
  const states = [];
  try {
    const stateList = readJsonFile(path.join(statesDir, "index.json"));

    if (Array.isArray(stateList)) {
      const stateDirs = getDirectoriesWithPrefix(statesDir);
      for (const dir of stateDirs) {
        const stateName = dir.replace(/^\d+-/, "").toUpperCase();
        const state = stateList.find((s) => s.name === stateName);
        if (state) {
          const stateDir = path.join(statesDir, dir);
          states.push({
            ...state,
            local_governments: buildLocalGovernments(
              path.join(stateDir, "lgas")
            ),
          });
        } else {
          console.warn(`State not found in index.json: ${stateName}`);
        }
      }
    } else {
      throw new Error("stateList is not an array");
    }
  } catch (error) {
    throw new Error(`Error building states: ${error.message}`);
  }

  return states;
};

// Function to get the entire dataset
const getData = (baseDir) => {
  try {
    return {
      states: buildStates(baseDir),
    };
  } catch (error) {
    throw new Error(`Error building dataset: ${error.message}`);
  }
};

export { getData };
