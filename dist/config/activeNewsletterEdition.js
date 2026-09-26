import { newsLetterTemplateFactCheckPeterObiMoneyOrDebtsAsGovernor } from "./emailTemplates.js";
import { newsInsightFactCheckPeterObiMoneyOrDebtsAsGovernor } from "./newsInsightContent.js";
/**
 * Switch the active edition here before sending a newsletter.
 * - Email HTML: config/emailTemplates.ts
 * - Mobile News & Insight body: config/newsInsightContent.ts
 */
export const ACTIVE_NEWSLETTER_EDITION = {
    buildEmailHtml: newsLetterTemplateFactCheckPeterObiMoneyOrDebtsAsGovernor,
    getNewsInsight: newsInsightFactCheckPeterObiMoneyOrDebtsAsGovernor,
};
//# sourceMappingURL=activeNewsletterEdition.js.map