import { getCitizenFaqByCategory, listCitizenFaq, } from "../../services/mobile/citizenFaqService.js";
import { asParamString } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const FAQ_CATEGORIES = new Set(["general", "observer"]);
export const getCitizenFaqListMobile = async (_req, res) => {
    try {
        const payload = listCitizenFaq();
        return res.status(200).json(payload);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getCitizenFaqCategoryMobile = async (req, res) => {
    try {
        const category = asParamString(req.params.category).toLowerCase();
        if (!FAQ_CATEGORIES.has(category)) {
            return res.status(400).json({ message: "Invalid FAQ category" });
        }
        const bundle = getCitizenFaqByCategory(category);
        if (!bundle) {
            return res.status(404).json({ message: "FAQ category not found" });
        }
        return res.status(200).json(bundle);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
//# sourceMappingURL=citizenFaqController.js.map