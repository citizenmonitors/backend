/**
 * One-shot export of all states → LGAs → wards (nested) → polling units
 * into a single JSON file for mobile offline use.
 *
 * Run: npm run export:locations-bundle
 *
 * For large datasets you may need: NODE_OPTIONS=--max-old-space-size=8192 npm run export:locations-bundle
 * Test subset: npx tsx scripts/exportLocationsMobileBundle.ts --limit=2
 */
import fs from "fs";
import path from "path";
import { findDirectoryWithPrefix } from "../services/Location/locationService.js";
import { slugifyForLocationMatch } from "../utils/locationNormalize.js";
/** Run from repo root (`npm run export:locations-bundle`) so paths resolve after `tsc` into `dist/`. */
const STATES_ROOT = path.resolve(process.cwd(), "data/states");
const OUT_DIR = path.resolve(process.cwd(), "data/generated");
const OUT_FILE = path.join(OUT_DIR, "locations-mobile-bundle.v1.json");
const BUNDLE_VERSION = 1;
function readJson(filePath) {
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function slimPollingUnit(row) {
    return {
        id: row.id,
        name: row.name,
        delimitation: row.delimitation,
        ward_id: row.ward_id,
        ward_name: row.ward_name,
        local_government_id: row.local_government_id,
        local_government_name: row.local_government_name,
        state_id: row.state_id,
        state_name: row.state_name,
        location: row.location,
    };
}
function resolveStateDirName(state) {
    const padded = state.id.padStart(2, "0");
    const dirs = fs
        .readdirSync(STATES_ROOT, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
    const byPrefix = dirs.find((name) => name.startsWith(`${padded}-`));
    if (byPrefix)
        return byPrefix;
    return findDirectoryWithPrefix(STATES_ROOT, slugifyForLocationMatch(state.name));
}
function buildWardSubtree(wardDirAbs) {
    const segment = path.basename(wardDirAbs);
    const unitsPath = path.join(wardDirAbs, "units", "index.json");
    if (fs.existsSync(unitsPath)) {
        const list = readJson(unitsPath);
        const pollingUnits = Array.isArray(list)
            ? list.map((row) => slimPollingUnit(row))
            : [];
        const metaPath = path.join(wardDirAbs, "index.json");
        const metaRaw = readJson(metaPath);
        return {
            segment,
            ...(metaRaw && typeof metaRaw === "object" ? { meta: metaRaw } : {}),
            pollingUnits,
        };
    }
    const metaPath = path.join(wardDirAbs, "index.json");
    const metaRaw = readJson(metaPath);
    const children = [];
    const entries = fs.readdirSync(wardDirAbs, { withFileTypes: true });
    for (const e of entries) {
        if (!e.isDirectory() || e.name === "units")
            continue;
        children.push(buildWardSubtree(path.join(wardDirAbs, e.name)));
    }
    return {
        segment,
        ...(metaRaw && typeof metaRaw === "object" ? { meta: metaRaw } : {}),
        ...(children.length > 0 ? { children } : {}),
    };
}
function buildLgaExport(lgaDirName, stateDir) {
    const lgaDir = path.join(stateDir, "lgas", lgaDirName);
    if (!fs.statSync(lgaDir).isDirectory())
        return null;
    const lgaMetaPath = path.join(lgaDir, "index.json");
    const lgaMeta = readJson(lgaMetaPath);
    const wardsRoot = path.join(lgaDir, "wards");
    const wards = [];
    if (fs.existsSync(wardsRoot)) {
        const wardDirs = fs.readdirSync(wardsRoot, { withFileTypes: true });
        for (const w of wardDirs) {
            if (!w.isDirectory())
                continue;
            wards.push(buildWardSubtree(path.join(wardsRoot, w.name)));
        }
    }
    return {
        folderSegment: lgaDirName,
        ...(lgaMeta && typeof lgaMeta === "object" ? { meta: lgaMeta } : {}),
        wards,
    };
}
function main() {
    const limitArg = process.argv.find((a) => a.startsWith("--limit="));
    const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
    const statesIndex = readJson(path.join(STATES_ROOT, "index.json"));
    if (!statesIndex || !Array.isArray(statesIndex)) {
        console.error("Missing or invalid data/states/index.json");
        process.exit(1);
    }
    const statesSlice = typeof limit === "number" && Number.isFinite(limit) && limit > 0
        ? statesIndex.slice(0, limit)
        : statesIndex;
    const exportedStates = [];
    for (const state of statesSlice) {
        const stateDirName = resolveStateDirName(state);
        if (!stateDirName) {
            console.warn(`Skip state (folder not found): ${state.name} id=${state.id}`);
            continue;
        }
        const stateDir = path.join(STATES_ROOT, stateDirName);
        const lgasIndexPath = path.join(stateDir, "lgas", "index.json");
        const lgasList = readJson(lgasIndexPath);
        const lgasOut = [];
        if (Array.isArray(lgasList)) {
            for (const lgaRow of lgasList) {
                const lgaName = typeof lgaRow.name === "string" ? lgaRow.name : String(lgaRow.name ?? "");
                const lgaDirName = findDirectoryWithPrefix(path.join(stateDir, "lgas"), slugifyForLocationMatch(lgaName));
                if (!lgaDirName) {
                    console.warn(`Skip LGA folder not found: state=${state.name} lga=${lgaName}`);
                    continue;
                }
                const exported = buildLgaExport(lgaDirName, stateDir);
                if (exported)
                    lgasOut.push(exported);
            }
        }
        exportedStates.push({
            id: state.id,
            name: state.name,
            folderSegment: stateDirName,
            lgas: lgasOut,
        });
        console.log(`Exported state ${state.name} (${lgasOut.length} LGAs)`);
    }
    const bundle = {
        version: BUNDLE_VERSION,
        exportedAt: new Date().toISOString(),
        source: "data/states",
        states: exportedStates,
    };
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(bundle), "utf8");
    const mb = (fs.statSync(OUT_FILE).size / (1024 * 1024)).toFixed(2);
    console.log(`\nWrote ${OUT_FILE} (${mb} MB)`);
    console.log("Mobile download: GET /api/v1/mobile/locations/offline-bundle\n" +
        "If the process ran out of memory, retry with NODE_OPTIONS=--max-old-space-size=8192");
}
main();
//# sourceMappingURL=exportLocationsMobileBundle.js.map