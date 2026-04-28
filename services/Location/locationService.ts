import fs from "fs";
import path from "path";
import type { Dirent } from "fs";
import {
  slugifyForLocationMatch,
  stripLeadingNumericSlugSegment,
} from "../../utils/locationNormalize.ts";

type NameItem = { name: string };
type PollingUnitDetail = Record<string, unknown>;

// Helper function to read JSON file
const readJsonFile = <T>(filePath: string): T[] | null => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Failed to read or parse file at ${filePath}: ${message}`
    );
    return null;
  }
};

// Function to build the local governments data
const buildLocalGovernments = (stateDir: string): string[] => {
  const localGovernments: string[] = [];
  const localGovernmentsDir = path.join(stateDir, "lgas", "index.json");
  console.log(`Looking for LGAs in directory: ${localGovernmentsDir}`);
  const lgaDetails = readJsonFile<NameItem>(localGovernmentsDir);
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
const buildWards = (
  lgaDir: string,
  subPathParts: string[] = []
): string[] => {
  const wards: string[] = [];
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
  const wardDetails = readJsonFile<NameItem>(wardsDir);
  if (wardDetails && Array.isArray(wardDetails)) {
    wardDetails.forEach((ward) => wards.push(ward.name)); // Only include ward name
  } else {
    console.warn(`Wards directory not found or not an array: ${wardsDir}`);
  }
  return wards;
};

// Function to build the polling units data
const buildPollingUnits = (lgaDir: string, wardParts: string[]): string[] => {
  const pollingUnits: string[] = [];
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
  const pollingUnitDetails = readJsonFile<NameItem>(pollingUnitsDir);
  if (pollingUnitDetails && Array.isArray(pollingUnitDetails)) {
    pollingUnitDetails.forEach((unit) =>
      pollingUnits.push(unit.name)
    ); // Only include polling unit names
  } else {
    console.warn(
      `Polling units directory not found or not an array: ${pollingUnitsDir}`
    );
  }
  return pollingUnits;
};

const buildPollingUnitDetails = (
  lgaDir: string,
  wardParts: string[]
): PollingUnitDetail[] => {
  let currentDir = path.join(lgaDir, "wards");

  for (const part of wardParts) {
    const subDirName = findDirectoryWithPrefix(currentDir, part);
    if (!subDirName) {
      return [];
    }
    currentDir = path.join(currentDir, subDirName);
  }

  const pollingUnitsDir = path.join(currentDir, "units", "index.json");
  const pollingUnitDetails = readJsonFile<PollingUnitDetail>(pollingUnitsDir);
  return Array.isArray(pollingUnitDetails) ? pollingUnitDetails : [];
};

// Function to build the states data
const buildStates = (statesDir: string): string[] => {
  const states: string[] = [];
  try {
    const stateList = readJsonFile<NameItem>(path.join(statesDir, "index.json"));

    if (Array.isArray(stateList)) {
      stateList.forEach((state) => {
        states.push(state.name); // Only include state name
      });
    } else {
      throw new Error("stateList is not an array");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error building states: ${message}`);
    throw error;
  }

  return states;
};

// Function to get the entire dataset
const getData = (baseDir: string): { states: string[] } => {
  try {
    return {
      states: buildStates(baseDir),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error building dataset: ${message}`);
  }
};

/**
 * Pick the best-matching child directory name under `baseDir` for a human
 * or slug-like `name` segment. Handles numeric prefixes (`28-ondo`),
 * punctuation, repeated spaces, and mixed separators.
 */
const findDirectoryWithPrefix = (
  baseDir: string,
  name: string
): string | null => {
  const q = slugifyForLocationMatch(name);
  if (!q) {
    return null;
  }

  let dirents: Dirent[];
  try {
    dirents = fs.readdirSync(baseDir, { withFileTypes: true }) as Dirent[];
  } catch {
    return null;
  }

  const dirNames = dirents
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const qTail = stripLeadingNumericSlugSegment(q);

  type Scored = { dirName: string; score: number; tieBreak: number };
  const scored: Scored[] = [];

  for (const dirName of dirNames) {
    const d = slugifyForLocationMatch(dirName);
    const dTail = stripLeadingNumericSlugSegment(d);

    let score = -1;
    let tieBreak = dirName.length;

    if (d === q) {
      score = 100_000;
    } else if (dTail === q || d === qTail) {
      score = 95_000;
    } else if (dTail === qTail && qTail.length >= 2) {
      score = 90_000;
    } else if (d.startsWith(`${q}-`) || d === `${q}`) {
      score = 85_000 - Math.min(5000, d.length - q.length);
    } else if (d.endsWith(`-${q}`) || d.endsWith(q)) {
      score = 80_000;
    } else if (d.includes(`-${q}-`) || d.includes(q)) {
      if (q.length >= 3) {
        score = 50_000 + Math.min(q.length, 30) * 100;
      }
    } else if (dTail.includes(q) || dTail.includes(qTail)) {
      if (Math.max(q.length, qTail.length) >= 3) {
        score = 45_000 + Math.min(q.length, 30) * 80;
      }
    } else if (q.includes(dTail) && dTail.length >= 4) {
      score = 40_000;
    }

    if (score > 0) {
      tieBreak = dirName.length;
      scored.push({ dirName, score, tieBreak });
    }
  }

  if (scored.length === 0) {
    return null;
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tieBreak - b.tieBreak;
  });

  return scored[0]?.dirName ?? null;
};

// Function to resolve nested directories
const resolveNestedDirectories = (
  baseDir: string,
  parts: string[]
): string | null => {
  let currentDir = baseDir;
  for (const [_, part] of parts.entries()) {
    const dirName = findDirectoryWithPrefix(currentDir, part);
    if (!dirName) {
      return null;
    }
    currentDir = path.join(currentDir, dirName);
  }
  return currentDir;
};

export {
  getData,
  buildLocalGovernments,
  buildWards,
  buildPollingUnits,
  buildPollingUnitDetails,
  findDirectoryWithPrefix,
  resolveNestedDirectories,
};

