import { buildNewsInsightCreatePayload } from "./articleAdminCreateBody.js";
import { createNewsInsightArticle, getNewsInsightByIdForAdmin, listNewsInsightsForAdmin, } from "../../services/adminService/newsInsightAdminService.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const parsePageLimit = (req) => {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? "30"), 10) || 30));
    return { page, limit };
};
export const createNewsInsightAdmin = async (req, res) => {
    try {
        const payload = await buildNewsInsightCreatePayload(req);
        const created = await createNewsInsightArticle(payload);
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
export const listNewsInsightsAdmin = async (req, res) => {
    try {
        const { page, limit } = parsePageLimit(req);
        const data = await listNewsInsightsForAdmin({ page, limit });
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getNewsInsightByIdAdmin = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid article ID" });
        }
        const row = await getNewsInsightByIdForAdmin(id);
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
//# sourceMappingURL=newsInsightAdminController.js.map