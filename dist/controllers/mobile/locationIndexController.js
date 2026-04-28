import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INDEX_ROOT = path.join(__dirname, "../../data/locations-index");
const isSafeStateIndexFile = (name) => /^[0-9]{2}-[a-z0-9.-]+\.json$/i.test(name);
export const getLocationsIndexManifest = (_req, res) => {
    const manifestPath = path.join(INDEX_ROOT, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
        return res.status(404).json({
            message: "Location index not generated. Run: npm run locations:index (optionally --state=28-ondo)",
        });
    }
    res.type("application/json");
    return res.sendFile(manifestPath);
};
export const getLocationsIndexStateFile = (req, res) => {
    const file = req.params.file;
    if (!file || !isSafeStateIndexFile(file)) {
        return res.status(400).json({ message: "Invalid index file name" });
    }
    const filePath = path.join(INDEX_ROOT, "by-state", file);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "State index not found" });
    }
    res.type("application/json");
    return res.sendFile(filePath);
};
//# sourceMappingURL=locationIndexController.js.map