import { newsLetterTemplateTwoFakeAgenciesDistractionOrDisaster } from "./emailTemplates.js";
import { newsInsightTwoFakeAgenciesDistractionOrDisaster } from "./newsInsightContent.js";
/**
 * Switch the active edition here before sending a newsletter.
 * - Email HTML: config/emailTemplates.ts
 * - Mobile News & Insight body: config/newsInsightContent.ts
 */
export const ACTIVE_NEWSLETTER_EDITION = {
    buildEmailHtml: newsLetterTemplateTwoFakeAgenciesDistractionOrDisaster,
    getNewsInsight: newsInsightTwoFakeAgenciesDistractionOrDisaster,
};
//# sourceMappingURL=activeNewsletterEdition.js.map