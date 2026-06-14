import {
  CITIZEN_FAQ_CATEGORIES,
  getFAQCategory,
  type FAQCategory,
  type FAQCategoryBundle,
} from "../../content/citizenFAQ/faqs.ts";

export const listCitizenFaq = (): {
  title: string;
  subtitle: string;
  categories: FAQCategoryBundle[];
} => ({
  title: "Frequently Asked Questions",
  subtitle: "Answers to common questions about Citizen Monitors and observer participation.",
  categories: CITIZEN_FAQ_CATEGORIES,
});

export const getCitizenFaqByCategory = (
  category: FAQCategory
): FAQCategoryBundle | null => {
  const bundle = getFAQCategory(category);
  return bundle ?? null;
};
