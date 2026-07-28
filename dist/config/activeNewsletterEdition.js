import { newsLetterTemplate2027ElectionsWhoIsBuyingYourVote } from "./emailTemplates.js";
import { newsInsight2027ElectionsWhoIsBuyingYourVote } from "./newsInsightContent.js";
/**
 * Switch the active edition here before sending a newsletter.
 * - Email HTML: config/emailTemplates.ts
 * - Mobile News & Insight body: config/newsInsightContent.ts
 */
export const ACTIVE_NEWSLETTER_EDITION = {
    buildEmailHtml: newsLetterTemplate2027ElectionsWhoIsBuyingYourVote,
    getNewsInsight: newsInsight2027ElectionsWhoIsBuyingYourVote,
};
//# sourceMappingURL=activeNewsletterEdition.js.map