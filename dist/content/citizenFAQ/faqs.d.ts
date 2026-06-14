/**
 * Citizen FAQ — frequently asked questions for the mobile app.
 * Content is informational only and not legal advice.
 */
export type FAQCategory = "general" | "observer";
export type FAQItem = {
    id: string;
    question: string;
    answer: string;
};
export type FAQCategoryBundle = {
    category: FAQCategory;
    title: string;
    items: FAQItem[];
};
export declare const CITIZEN_FAQ_CATEGORIES: FAQCategoryBundle[];
export declare const getFAQCategory: (category: FAQCategory) => FAQCategoryBundle | undefined;
//# sourceMappingURL=faqs.d.ts.map