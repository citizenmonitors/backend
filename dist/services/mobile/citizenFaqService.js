import { CITIZEN_FAQ_CATEGORIES, getFAQCategory, } from "../../content/citizenFAQ/faqs.js";
export const listCitizenFaq = () => ({
    title: "Frequently Asked Questions",
    subtitle: "Answers to common questions about Citizen Monitors and observer participation.",
    categories: CITIZEN_FAQ_CATEGORIES,
});
export const getCitizenFaqByCategory = (category) => {
    const bundle = getFAQCategory(category);
    return bundle ?? null;
};
//# sourceMappingURL=citizenFaqService.js.map