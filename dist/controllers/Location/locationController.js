import path from "path";
import { getData, buildLocalGovernments, buildWards, buildPollingUnits, findDirectoryWithPrefix, resolveNestedDirectories, } from "../../services/Location/locationService.js";
import { getOrSetCache } from "../../utils/cache.js";
import { slugifyForLocationMatch } from "../../utils/locationNormalize.js";
import { projectPath } from "../../utils/projectRoot.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const asParamString = (value) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
global.baseDir = projectPath("data", "states");
/** Align URL/path segments with the same slug rules used under `data/states`. */
const normalizeName = (name) => slugifyForLocationMatch(name);
// Helper function to transform response
const transformResponse = (data) => data.map((item) => ({ name: item }));
// Endpoint to get all states
const getStates = async (_req, res) => {
    try {
        const data = await getOrSetCache("locations:states", 3600, () => getData(global.baseDir));
        return res.json(transformResponse(data.states));
    }
    catch (error) {
        console.error(`Error getting states: ${getErrorMessage(error)}`);
        return res.status(500).send("Error getting states");
    }
};
// Endpoint to get LGAs for a specific state
const getLGAs = async (req, res) => {
    const state = normalizeName(decodeURIComponent(asParamString(req.params.state)));
    console.log(`Requested state: ${state}`);
    const stateDirName = findDirectoryWithPrefix(global.baseDir, state);
    if (!stateDirName) {
        console.error(`State directory not found for: ${state}`);
        return res.status(404).send(`State directory not found for: ${state}`);
    }
    const stateDir = path.join(global.baseDir, stateDirName);
    console.log(`Resolved state directory: ${stateDir}`);
    try {
        const localGovernments = await getOrSetCache(`locations:lgas:${state}`, 3600, () => buildLocalGovernments(stateDir));
        return res.json(transformResponse(localGovernments));
    }
    catch (error) {
        console.error(`Error getting LGAs: ${getErrorMessage(error)}`);
        return res.status(500).send("Error getting LGAs");
    }
};
// Endpoint to get wards for a specific LGA
const getWards = async (req, res) => {
    const state = normalizeName(decodeURIComponent(asParamString(req.params.state)));
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
    const lgaDir = resolveNestedDirectories(path.join(global.baseDir, stateDirName, "lgas"), lgaParts);
    if (!lgaDir) {
        console.error(`LGA directory not found for: ${lgaPath}`);
        return res.status(404).send(`LGA directory not found for: ${lgaPath}`);
    }
    console.log(`Resolved LGA directory: ${lgaDir}`);
    try {
        const cacheKey = `locations:wards:${state}:${lgaParts.join("/")}`;
        const wards = await getOrSetCache(cacheKey, 3600, () => buildWards(lgaDir));
        return res.json(transformResponse(wards));
    }
    catch (error) {
        console.error(`Error getting wards: ${getErrorMessage(error)}`);
        return res.status(500).send("Error getting wards");
    }
};
const getPollingUnits = async (req, res) => {
    const state = normalizeName(decodeURIComponent(asParamString(req.params.state)));
    const lgaPath = req.params[0];
    const wardPath = req.params[1];
    console.log(`Requested state: ${state}, LGA path: ${lgaPath}, Ward path: ${wardPath}`);
    const stateDirName = findDirectoryWithPrefix(global.baseDir, state);
    if (!stateDirName) {
        console.error(`State directory not found for: ${state}`);
        return res.status(404).send(`State directory not found for: ${state}`);
    }
    const lgaParts = lgaPath
        .split("/")
        .map(decodeURIComponent)
        .map(normalizeName);
    const lgaDir = resolveNestedDirectories(path.join(global.baseDir, stateDirName, "lgas"), lgaParts);
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
        const cacheKey = `locations:polling-units:${state}:${lgaParts.join("/")}:${wardParts.join("/")}`;
        const pollingUnits = await getOrSetCache(cacheKey, 3600, () => buildPollingUnits(lgaDir, wardParts));
        return res.json(transformResponse(pollingUnits));
    }
    catch (error) {
        console.error(`Error getting polling units: ${getErrorMessage(error)}`);
        return res.status(500).send("Error getting polling units");
    }
};
export { getStates, getLGAs, getWards, getPollingUnits };
//# sourceMappingURL=locationController.js.map