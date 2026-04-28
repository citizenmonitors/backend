/**
 * Build deterministic location index files from `data/states` for mobile/web.
 *
 * Usage:
 *   npx tsx scripts/buildLocationsIndex.ts
 *   npx tsx scripts/buildLocationsIndex.ts --state=28-ondo
 *   npx tsx scripts/buildLocationsIndex.ts --stateId=28
 *
 * Output (gitignored by default):
 *   data/locations-index/manifest.json
 *   data/locations-index/by-state/<state-folder>.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "../data/states");
const OUT_DIR = path.join(__dirname, "../data/locations-index");
const BY_STATE_DIR = path.join(OUT_DIR, "by-state");
function readJson(filePath) {
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function idFolderPrefixes(id) {
    const raw = id.trim();
    if (!raw)
        return [];
    const n = raw.replace(/^0+/, "") || "0";
    const padded2 = n.padStart(2, "0");
    const padded3 = n.padStart(3, "0");
    return [...new Set([raw, padded2, padded3])];
}
function findChildDirByIdPrefix(parentDir, id) {
    let entries;
    try {
        entries = fs.readdirSync(parentDir, { withFileTypes: true });
    }
    catch {
        return null;
    }
    for (const cand of idFolderPrefixes(id)) {
        const prefix = `${cand}-`;
        const hit = entries.find((e) => e.isDirectory() && e.name.startsWith(prefix));
        if (hit)
            return hit.name;
    }
    return null;
}
function mapPollingUnits(raw) {
    if (!Array.isArray(raw))
        return [];
    return raw.map((row) => {
        const r = row;
        return {
            id: String(r.id ?? ""),
            name: String(r.name ?? ""),
            abbreviation: r.abbreviation != null ? String(r.abbreviation) : undefined,
            delimitation: r.delimitation != null ? String(r.delimitation) : undefined,
        };
    });
}
function collectWardLeaves(wardFolderName, wardDir) {
    const unitsFile = path.join(wardDir, "units", "index.json");
    if (fs.existsSync(unitsFile)) {
        const raw = readJson(unitsFile);
        return [
            {
                wardId: "",
                wardName: "",
                wardFolder: wardFolderName,
                pathSegments: [wardFolderName],
                pollingUnits: mapPollingUnits(raw),
            },
        ];
    }
    let dirents;
    try {
        dirents = fs.readdirSync(wardDir, { withFileTypes: true });
    }
    catch {
        return [];
    }
    const leaves = [];
    for (const d of dirents) {
        if (!d.isDirectory() || d.name === "units")
            continue;
        const subDir = path.join(wardDir, d.name);
        const subUnits = path.join(subDir, "units", "index.json");
        if (fs.existsSync(subUnits)) {
            const raw = readJson(subUnits);
            leaves.push({
                wardId: "",
                wardName: "",
                wardFolder: wardFolderName,
                pathSegments: [wardFolderName, d.name],
                pollingUnits: mapPollingUnits(raw),
            });
        }
    }
    return leaves;
}
function parseArgs(argv) {
    let stateFolder = null;
    let stateId = null;
    for (const a of argv) {
        if (a.startsWith("--state="))
            stateFolder = a.slice("--state=".length).trim();
        if (a.startsWith("--stateId="))
            stateId = a.slice("--stateId=".length).trim();
    }
    return { stateFolder, stateId };
}
async function main() {
    const { stateFolder, stateId } = parseArgs(process.argv.slice(2));
    fs.mkdirSync(BY_STATE_DIR, { recursive: true });
    const statesIndex = readJson(path.join(ROOT, "index.json"));
    if (!statesIndex || !Array.isArray(statesIndex)) {
        console.error("Missing or invalid data/states/index.json");
        process.exit(1);
    }
    const manifestStates = [];
    for (const st of statesIndex) {
        const dirName = findChildDirByIdPrefix(ROOT, st.id);
        if (!dirName) {
            console.warn(`No state folder for id=${st.id} (${st.name})`);
            continue;
        }
        if (stateFolder && dirName !== stateFolder)
            continue;
        if (stateId && st.id !== stateId)
            continue;
        const stateDir = path.join(ROOT, dirName);
        const lgaIndexPath = path.join(stateDir, "lgas", "index.json");
        const lgas = readJson(lgaIndexPath);
        if (!lgas || !Array.isArray(lgas)) {
            console.warn(`No LGAs index for ${dirName}`);
            continue;
        }
        const lgaOut = [];
        for (const lga of lgas) {
            const lgaFolder = findChildDirByIdPrefix(path.join(stateDir, "lgas"), lga.id);
            if (!lgaFolder) {
                console.warn(`  No LGA folder for id=${lga.id} (${lga.name}) in ${dirName}`);
                continue;
            }
            const lgaDir = path.join(stateDir, "lgas", lgaFolder);
            const wardsIndexPath = path.join(lgaDir, "wards", "index.json");
            const wards = readJson(wardsIndexPath);
            if (!wards || !Array.isArray(wards)) {
                console.warn(`  No wards index for LGA ${lgaFolder}`);
                continue;
            }
            const wardsOut = [];
            for (const w of wards) {
                const wardFolder = findChildDirByIdPrefix(path.join(lgaDir, "wards"), w.id);
                if (!wardFolder) {
                    console.warn(`    No ward folder for id=${w.id} (${w.name}) in ${lgaFolder}`);
                    continue;
                }
                const wardDir = path.join(lgaDir, "wards", wardFolder);
                const rawLeaves = collectWardLeaves(wardFolder, wardDir);
                const leaves = rawLeaves.map((leaf) => ({
                    ...leaf,
                    wardId: w.id,
                    wardName: w.name,
                }));
                wardsOut.push({
                    id: w.id,
                    name: w.name,
                    segment: wardFolder,
                    leaves,
                });
            }
            lgaOut.push({
                id: lga.id,
                name: lga.name,
                segment: lgaFolder,
                wards: wardsOut,
            });
        }
        const payload = {
            version: 1,
            generatedAt: new Date().toISOString(),
            state: { id: st.id, name: st.name, segment: dirName },
            lgas: lgaOut,
        };
        const outFile = path.join(BY_STATE_DIR, `${dirName}.json`);
        fs.writeFileSync(outFile, JSON.stringify(payload), "utf8");
        manifestStates.push({
            id: st.id,
            name: st.name,
            segment: dirName,
            file: `by-state/${dirName}.json`,
        });
        console.log(`Wrote ${outFile}`);
    }
    const manifest = {
        version: 1,
        generatedAt: new Date().toISOString(),
        source: "data/states",
        states: manifestStates,
    };
    fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
    console.log(`Wrote ${path.join(OUT_DIR, "manifest.json")} (${manifestStates.length} states)`);
}
void main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=buildLocationsIndex.js.map