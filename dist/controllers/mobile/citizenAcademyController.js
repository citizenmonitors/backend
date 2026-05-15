import { getCitizenAcademyArticle, listCitizenAcademyArticles, } from "../../services/mobile/citizenAcademyService.js";
import { asParamString } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const getCitizenAcademyListMobile = async (_req, res) => {
    try {
        const articles = listCitizenAcademyArticles();
        return res.status(200).json({
            title: "Citizen Academy",
            subtitle: "Discover all you need to know about election knowledge and awareness in Nigeria.",
            articles,
        });
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getCitizenAcademyArticleMobile = async (req, res) => {
    try {
        const slug = asParamString(req.params.slug).toLowerCase();
        if (!slug || !slugPattern.test(slug)) {
            return res.status(400).json({ message: "Invalid article slug" });
        }
        const article = getCitizenAcademyArticle(slug);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        return res.status(200).json(article);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
//# sourceMappingURL=citizenAcademyController.js.map