import fs from "fs";
import path from "path";
import { slugifyForLocationMatch, stripLeadingNumericSlugSegment, } from "../../utils/locationNormalize.js";
// Helper function to read JSON file
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Failed to read or parse file at ${filePath}: ${message}`);
        return null;
    }
};
// Function to build the local governments data
const buildLocalGovernments = (stateDir) => {
    const localGovernments = [];
    const localGovernmentsDir = path.join(stateDir, "lgas", "index.json");
    console.log(`Looking for LGAs in directory: ${localGovernmentsDir}`);
    const lgaDetails = readJsonFile(localGovernmentsDir);
    if (lgaDetails && Array.isArray(lgaDetails)) {
        lgaDetails.forEach((lga) => localGovernments.push(lga.name)); // Only include LGA name
    }
    else {
        console.warn(`Local governments directory not found or not an array: ${localGovernmentsDir}`);
    }
    return localGovernments;
};
// Function to build the wards data
const buildWards = (lgaDir, subPathParts = []) => {
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
    }
    else {
        console.warn(`Wards directory not found or not an array: ${wardsDir}`);
    }
    return wards;
};
/** Resolve ward path segments under `.../wards` to an absolute ward folder. */
const resolveWardDirectory = (lgaDir, wardParts) => {
    let currentDir = path.join(lgaDir, "wards");
    for (const part of wardParts) {
        const subDirName = findDirectoryWithPrefix(currentDir, part);
        if (!subDirName) {
            console.warn(`Subdirectory not found for: ${part}`);
            return null;
        }
        currentDir = path.join(currentDir, subDirName);
    }
    return currentDir;
};
/**
 * Collect polling units from a ward folder. Supports flat `units/index.json`
 * and nested sub-areas (e.g. `5869-shasha/akowonjo/units/index.json`).
 */
const collectPollingUnitNamesFromWardDir = (wardDir) => {
    const directPath = path.join(wardDir, "units", "index.json");
    if (fs.existsSync(directPath)) {
        const rows = readJsonFile(directPath);
        return Array.isArray(rows) ? rows.map((row) => row.name) : [];
    }
    let dirents;
    try {
        dirents = fs.readdirSync(wardDir, { withFileTypes: true });
    }
    catch {
        return [];
    }
    const names = [];
    for (const entry of dirents) {
        if (!entry.isDirectory() || entry.name === "units")
            continue;
        names.push(...collectPollingUnitNamesFromWardDir(path.join(wardDir, entry.name)));
    }
    return names;
};
const collectPollingUnitDetailsFromWardDir = (wardDir) => {
    const directPath = path.join(wardDir, "units", "index.json");
    if (fs.existsSync(directPath)) {
        const rows = readJsonFile(directPath);
        return Array.isArray(rows) ? rows : [];
    }
    let dirents;
    try {
        dirents = fs.readdirSync(wardDir, { withFileTypes: true });
    }
    catch {
        return [];
    }
    const details = [];
    for (const entry of dirents) {
        if (!entry.isDirectory() || entry.name === "units")
            continue;
        details.push(...collectPollingUnitDetailsFromWardDir(path.join(wardDir, entry.name)));
    }
    return details;
};
// Function to build the polling units data
const buildPollingUnits = (lgaDir, wardParts) => {
    const wardDir = resolveWardDirectory(lgaDir, wardParts);
    if (!wardDir)
        return [];
    console.log(`Looking for polling units under ward directory: ${wardDir}`);
    return collectPollingUnitNamesFromWardDir(wardDir);
};
const buildPollingUnitDetails = (lgaDir, wardParts) => {
    const wardDir = resolveWardDirectory(lgaDir, wardParts);
    if (!wardDir)
        return [];
    return collectPollingUnitDetailsFromWardDir(wardDir);
};
// Function to build the states data
const buildStates = (statesDir) => {
    const states = [];
    try {
        const stateList = readJsonFile(path.join(statesDir, "index.json"));
        if (Array.isArray(stateList)) {
            stateList.forEach((state) => {
                states.push(state.name); // Only include state name
            });
        }
        else {
            throw new Error("stateList is not an array");
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error building states: ${message}`);
        throw error;
    }
    return states;
};
// Function to get the entire dataset
const getData = (baseDir) => {
    try {
        return {
            states: buildStates(baseDir),
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Error building dataset: ${message}`);
    }
};
/**
 * Pick the best-matching child directory name under `baseDir` for a human
 * or slug-like `name` segment. Handles numeric prefixes (`28-ondo`),
 * punctuation, repeated spaces, and mixed separators.
 */
const findDirectoryWithPrefix = (baseDir, name) => {
    const q = slugifyForLocationMatch(name);
    if (!q) {
        return null;
    }
    let dirents;
    try {
        dirents = fs.readdirSync(baseDir, { withFileTypes: true });
    }
    catch {
        return null;
    }
    const dirNames = dirents
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
    const qTail = stripLeadingNumericSlugSegment(q);
    const scored = [];
    for (const dirName of dirNames) {
        const d = slugifyForLocationMatch(dirName);
        const dTail = stripLeadingNumericSlugSegment(d);
        let score = -1;
        let tieBreak = dirName.length;
        if (d === q) {
            score = 100_000;
        }
        else if (dTail === q || d === qTail) {
            score = 95_000;
        }
        else if (dTail === qTail && qTail.length >= 2) {
            score = 90_000;
        }
        else if (d.startsWith(`${q}-`) || d === `${q}`) {
            score = 85_000 - Math.min(5000, d.length - q.length);
        }
        else if (d.endsWith(`-${q}`) || d.endsWith(q)) {
            score = 80_000;
        }
        else if (d.includes(`-${q}-`) || d.includes(q)) {
            if (q.length >= 3) {
                score = 50_000 + Math.min(q.length, 30) * 100;
            }
        }
        else if (dTail.includes(q) || dTail.includes(qTail)) {
            if (Math.max(q.length, qTail.length) >= 3) {
                score = 45_000 + Math.min(q.length, 30) * 80;
            }
        }
        else if (q.includes(dTail) && dTail.length >= 4) {
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
        if (b.score !== a.score)
            return b.score - a.score;
        return a.tieBreak - b.tieBreak;
    });
    return scored[0]?.dirName ?? null;
};
// Function to resolve nested directories
const resolveNestedDirectories = (baseDir, parts) => {
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
export { getData, buildLocalGovernments, buildWards, buildPollingUnits, buildPollingUnitDetails, findDirectoryWithPrefix, resolveNestedDirectories, };
//# sourceMappingURL=locationService.js.map