import { newsLetterTemplateFakeProductsFakePromisesWhyDoNigeriansAcceptLess } from "./emailTemplates.ts";
import { newsInsightFakeProductsFakePromisesWhyDoNigeriansAcceptLess } from "./newsInsightContent.ts";
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
  buildEmailHtml: newsLetterTemplateFakeProductsFakePromisesWhyDoNigeriansAcceptLess,
  getNewsInsight: newsInsightFakeProductsFakePromisesWhyDoNigeriansAcceptLess,
};
