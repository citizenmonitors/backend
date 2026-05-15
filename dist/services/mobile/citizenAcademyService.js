import { CITIZEN_ACADEMY_ARTICLES, getAcademyArticleBySlug, } from "../../content/citizenAcademy/articles.js";
export const listCitizenAcademyArticles = () => CITIZEN_ACADEMY_ARTICLES.map(({ slug, title, category, readMinutes, summary }) => ({
    slug,
    title,
    category,
    readMinutes,
    summary,
}));
export const getCitizenAcademyArticle = (slug) => {
    const article = getAcademyArticleBySlug(slug);
    return article ?? null;
};
//# sourceMappingURL=citizenAcademyService.js.map