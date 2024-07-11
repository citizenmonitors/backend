// import fs from "fs";
// import path from "path";

// // Helper function to read JSON file
// const readJsonFile = (filePath) => {
//   try {
//     const data = fs.readFileSync(filePath, "utf8");
//     return JSON.parse(data);
//   } catch (error) {
//     throw new Error(
//       `Failed to read or parse file at ${filePath}: ${error.message}`
//     );
//   }
// };

// // Function to get directory names with numeric prefixes
// const getDirectoriesWithPrefix = (baseDir) => {
//   return fs
//     .readdirSync(baseDir, { withFileTypes: true })
//     .filter((dirent) => dirent.isDirectory())
//     .map((dirent) => dirent.name);
// };

// // Function to build the polling units data
// const buildPollingUnits = (pollingUnitsDir) => {
//   const pollingUnits = [];
//   if (fs.existsSync(pollingUnitsDir)) {
//     const pollingUnitDirs = getDirectoriesWithPrefix(pollingUnitsDir);
//     for (const dir of pollingUnitDirs) {
//       const fullPath = path.join(pollingUnitsDir, dir, "");
//       try {
//         const pollingUnitDetails = readJsonFile(
//           path.join(fullPath, "index.json")
//         );
//         pollingUnits.push(...pollingUnitDetails);
//       } catch (error) {
//         console.error(
//           `Error reading polling unit at ${fullPath}: ${error.message}`
//         );
//       }
//     }
//   }
//   return pollingUnits;
// };

// // Function to build the wards data
// const buildWards = (wardsDir) => {
//   const wards = [];
//   if (fs.existsSync(wardsDir)) {
//     const wardDirs = getDirectoriesWithPrefix(wardsDir);
//     for (const dir of wardDirs) {
//       const fullPath = path.join(wardsDir, dir);
//       try {
//         const wardDetails = readJsonFile(path.join(fullPath, "index.json"));
//         wards.push({
//           ...wardDetails,
//           polling_units: buildPollingUnits(fullPath),
//         });
//       } catch (error) {
//         // console.error(`Error reading ward at ${fullPath}: ${error.message}`);
//       }
//     }
//   }
//   return wards;
// };

// // Function to build the local governments data
// const buildLocalGovernments = (localGovernmentsDir) => {
//   const localGovernments = [];
//   if (fs.existsSync(localGovernmentsDir)) {
//     const lgaDirs = getDirectoriesWithPrefix(localGovernmentsDir);
//     for (const dir of lgaDirs) {
//       const fullPath = path.join(localGovernmentsDir, dir);
//       try {
//         const lgaDetails = readJsonFile(path.join(fullPath, "index.json"));
//         localGovernments.push({
//           ...lgaDetails,
//           wards: buildWards(path.join(fullPath, "wards")),
//         });
//       } catch (error) {
//         // console.error(
//         //   `Error reading local government at ${fullPath}: ${error.message}`
//         // );
//       }
//     }
//   }
//   return localGovernments;
// };

// // Function to build the states data
// const buildStates = (statesDir) => {
//   const states = [];
//   try {
//     const stateList = readJsonFile(path.join(statesDir, "index.json"));

//     if (Array.isArray(stateList)) {
//       const stateDirs = getDirectoriesWithPrefix(statesDir);
//       for (const dir of stateDirs) {
//         const stateName = dir.replace(/^\d+-/, "").toUpperCase();
//         const state = stateList.find((s) => s.name === stateName);
//         if (state) {
//           const stateDir = path.join(statesDir, dir);
//           states.push({
//             ...state,
//             local_governments: buildLocalGovernments(
//               path.join(stateDir, "lgas")
//             ),
//           });
//         } else {
//           console.warn(`State not found in index.json: ${stateName}`);
//         }
//       }
//     } else {
//       throw new Error("stateList is not an array");
//     }
//   } catch (error) {
//     throw new Error(`Error building states: ${error.message}`);
//   }

//   return states;
// };

// // Function to get the entire dataset
// const getData = (baseDir) => {
//   try {
//     return {
//       states: buildStates(baseDir),
//     };
//   } catch (error) {
//     throw new Error(`Error building dataset: ${error.message}`);
//   }
// };

// export { getData };


import fs from "fs";
import path from "path";

// Helper function to read JSON file
const readJsonFile = (filePath) => {
  try {
    console.log(`Reading JSON file: ${filePath}`);
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(
      `Failed to read or parse file at ${filePath}: ${error.message}`
    );
    return null;
  }
};

// Function to build the local governments data
export const buildLocalGovernments = (stateDir) => {
  const localGovernments = [];
  const localGovernmentsDir = path.join(stateDir, "lgas", "index.json");
  console.log(`Looking for LGAs in directory: ${localGovernmentsDir}`);
  const lgaDetails = readJsonFile(localGovernmentsDir);
  if (lgaDetails && Array.isArray(lgaDetails)) {
    lgaDetails.forEach((lga) => localGovernments.push(lga.name)); // Only include LGA name
  } else {
    console.warn(
      `Local governments directory not found or not an array: ${localGovernmentsDir}`
    );
  }
  return localGovernments;
};

// Function to build the wards data
export const buildWards = (lgaDir, subPathParts = []) => {
  const wards = [];
  let currentDir = path.join(lgaDir, "wards");

  // Navigate through the subpath parts to get to the correct directory
  for (const part of subPathParts) {
    const subDirName = findDirectoryWithPrefix(currentDir, part);
    if (!subDirName) {
      console.warn(`Subdirectory not found for: ${part}`);
      return wards;
    }
    currentDir = path.join(currentDir, subDirName);
  }

  const wardsDir = path.join(currentDir, "index.json");
  console.log(`Looking for wards in directory: ${wardsDir}`);
  const wardDetails = readJsonFile(wardsDir);
  if (wardDetails && Array.isArray(wardDetails)) {
    wardDetails.forEach((ward) => wards.push(ward.name)); // Only include ward name
  } else {
    console.warn(`Wards directory not found or not an array: ${wardsDir}`);
  }
  return wards;
};

// Function to build the polling units data
export const buildPollingUnits = (lgaDir, wardParts) => {
  const pollingUnits = [];
  let currentDir = path.join(lgaDir, "wards");

  // Navigate through the ward parts to get to the correct directory
  for (const part of wardParts) {
    const subDirName = findDirectoryWithPrefix(currentDir, part);
    if (!subDirName) {
      console.warn(`Subdirectory not found for: ${part}`);
      return pollingUnits;
    }
    currentDir = path.join(currentDir, subDirName);
  }

  const pollingUnitsDir = path.join(currentDir, "units", "index.json");
  console.log(`Looking for polling units in directory: ${pollingUnitsDir}`);
  const pollingUnitDetails = readJsonFile(pollingUnitsDir);
  if (pollingUnitDetails && Array.isArray(pollingUnitDetails)) {
    pollingUnitDetails.forEach((unit) => pollingUnits.push(unit.name)); // Only include polling unit names
  } else {
    console.warn(
      `Polling units directory not found or not an array: ${pollingUnitsDir}`
    );
  }
  return pollingUnits;
};

// Function to build the states data
export const buildStates = () => {
  const states = [];
  try {
    const stateList = readJsonFile(path.join(global.baseDir, "index.json"));
    console.log(
      `State list from index.json: ${JSON.stringify(stateList, null, 2)}`
    );

    if (Array.isArray(stateList)) {
      stateList.forEach((state) => {
        states.push(state.name); // Only include state name
      });
    } else {
      throw new Error("stateList is not an array");
    }
  } catch (error) {
    console.error(`Error building states: ${error.message}`);
    throw error;
  }

  return states;
};

// Function to get the entire dataset
export const getData = () => {
  try {
    return {
      states: buildStates(),
    };
  } catch (error) {
    throw new Error(`Error building dataset: ${error.message}`);
  }
};

// Function to find the directory with prefix
export const findDirectoryWithPrefix = (baseDir, name) => {
  console.log(
    `Looking for directory with prefix: ${name} in base directory: ${baseDir}`
  );

  const encodedName = encodeURIComponent(name).toLowerCase();

  const directories = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        dirent.name
          .toLowerCase()
          .includes(encodedName.replace(/%20/g, "-").replace(/%2f/g, "-"))
    )
    .map((dirent) => dirent.name);

  if (directories.length) {
    console.log(`Found directory: ${directories[0]}`);
  } else {
    console.warn(
      `Directory with prefix ${name} not found in base directory: ${baseDir}`
    );
  }

  return directories.length ? directories[0] : null;
};

// Function to resolve nested directories
export const resolveNestedDirectories = (baseDir, parts) => {
  let currentDir = baseDir;
  for (const [index, part] of parts.entries()) {
    const dirName = findDirectoryWithPrefix(currentDir, part);
    if (!dirName) {
      return null;
    }
    currentDir = path.join(currentDir, dirName);
  }
  return currentDir;
};
