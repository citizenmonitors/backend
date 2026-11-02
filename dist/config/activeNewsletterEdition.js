import { newsLetterTemplateCanInecConductCredibleElectionsIn2027 } from "./emailTemplates.js";
import { newsInsightCanInecConductCredibleElectionsIn2027 } from "./newsInsightContent.js";
/**
 * Switch the active edition here before sending a newsletter.
 * - Email HTML: config/emailTemplates.ts
 * - Mobile News & Insight body: config/newsInsightContent.ts
 */
export const ACTIVE_NEWSLETTER_EDITION = {
    buildEmailHtml: newsLetterTemplateCanInecConductCredibleElectionsIn2027,
    getNewsInsight: newsInsightCanInecConductCredibleElectionsIn2027,
};
//# sourceMappingURL=activeNewsletterEdition.js.map