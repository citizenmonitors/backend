import { buildPressCoverageCreatePayload } from "./articleAdminCreateBody.js";
import { createPressCoverageArticle, getPressCoverageByIdForAdmin, listPressCoverageForAdmin, } from "../../services/adminService/pressCoverageAdminService.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const parsePageLimit = (req) => {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? "30"), 10) || 30));
    return { page, limit };
};
export const createPressCoverageAdmin = async (req, res) => {
    try {
        const payload = await buildPressCoverageCreatePayload(req);
        const created = await createPressCoverageArticle(payload);
        return res.status(201).json(created);
    }
    catch (error) {
        const msg = getErrorMessage(error);
        if (msg.includes("required") ||
            msg.includes("Invalid") ||
            msg.includes("thumbnailURL") ||
            msg.includes("upload")) {
            return res.status(400).json({ message: msg });
        }
        return res.status(500).json({ message: msg });
    }
};
export const listPressCoverageAdmin = async (req, res) => {
    try {
        const { page, limit } = parsePageLimit(req);
        const data = await listPressCoverageForAdmin({ page, limit });
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getPressCoverageByIdAdmin = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid article ID" });
        }
        const row = await getPressCoverageByIdForAdmin(id);
        return res.status(200).json(row);
    }
    catch (error) {
        const msg = getErrorMessage(error);
        if (msg === "Article not found")
            return res.status(404).json({ message: msg });
        if (msg.includes("Invalid"))
            return res.status(400).json({ message: msg });
        return res.status(500).json({ message: msg });
    }
};
//# sourceMappingURL=pressCoverageAdminController.js.map