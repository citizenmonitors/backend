import { type FAQCategory, type FAQCategoryBundle } from "../../content/citizenFAQ/faqs.ts";
export declare const listCitizenFaq: () => {
    title: string;
    subtitle: string;
    categories: FAQCategoryBundle[];
};
export declare const getCitizenFaqByCategory: (category: FAQCategory) => FAQCategoryBundle | null;
//# sourceMappingURL=citizenFaqService.d.ts.map