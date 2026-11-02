import { newsLetterTemplateCanInecConductCredibleElectionsIn2027 } from "./emailTemplates.ts";
import { newsInsightCanInecConductCredibleElectionsIn2027 } from "./newsInsightContent.ts";
import type { NewsInsightArticleContent } from "./newsInsightContent.ts";

export type NewsletterEdition = {
  buildEmailHtml: () => string;
  getNewsInsight: () => NewsInsightArticleContent;
};

/**
 * Switch the active edition here before sending a newsletter.
 * - Email HTML: config/emailTemplates.ts
 * - Mobile News & Insight body: config/newsInsightContent.ts
 */
export const ACTIVE_NEWSLETTER_EDITION: NewsletterEdition = {
  buildEmailHtml: newsLetterTemplateCanInecConductCredibleElectionsIn2027,
  getNewsInsight: newsInsightCanInecConductCredibleElectionsIn2027,
};
