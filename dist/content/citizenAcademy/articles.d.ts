/**
 * Citizen Academy — curated educational articles for the mobile app.
 * Content is informational only and not legal advice.
 */
export type AcademyCategory = "Essential" | "LAW" | "Security";
export type AcademySection = {
    heading: string;
    paragraphs: string[];
};
export type AcademyArticle = {
    slug: string;
    title: string;
    category: AcademyCategory;
    readMinutes: number;
    summary: string;
    sections: AcademySection[];
};
export declare const CITIZEN_ACADEMY_ARTICLES: AcademyArticle[];
export declare const getAcademyArticleBySlug: (slug: string) => AcademyArticle | undefined;
//# sourceMappingURL=articles.d.ts.map