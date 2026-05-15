import {
  CITIZEN_ACADEMY_ARTICLES,
  getAcademyArticleBySlug,
  type AcademyArticle,
} from "../../content/citizenAcademy/articles.ts";

export type AcademyListItem = Pick<
  AcademyArticle,
  "slug" | "title" | "category" | "readMinutes" | "summary"
>;

export const listCitizenAcademyArticles = (): AcademyListItem[] =>
  CITIZEN_ACADEMY_ARTICLES.map(({ slug, title, category, readMinutes, summary }) => ({
    slug,
    title,
    category,
    readMinutes,
    summary,
  }));

export const getCitizenAcademyArticle = (slug: string): AcademyArticle | null => {
  const article = getAcademyArticleBySlug(slug);
  return article ?? null;
};
