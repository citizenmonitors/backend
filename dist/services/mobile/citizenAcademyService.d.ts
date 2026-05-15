import { type AcademyArticle } from "../../content/citizenAcademy/articles.ts";
export type AcademyListItem = Pick<AcademyArticle, "slug" | "title" | "category" | "readMinutes" | "summary">;
export declare const listCitizenAcademyArticles: () => AcademyListItem[];
export declare const getCitizenAcademyArticle: (slug: string) => AcademyArticle | null;
//# sourceMappingURL=citizenAcademyService.d.ts.map