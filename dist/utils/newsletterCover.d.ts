export type NewsletterCover = {
    file: string;
    themes: string[];
    url: string;
};
export declare const newsletterCoverUrl: (file: string) => string;
/** Rewrite Render / local newsletter-cover URLs to the matching Firebase public URL. */
export declare const rewriteLegacyCoverUrl: (url: string) => string;
export declare const rewriteLegacyCoverUrlsInHtml: (html: string) => string;
/** Upload every catalog cover to Firebase and return Firebase URLs. */
export declare const ensureNewsletterCoversOnFirebase: () => Promise<NewsletterCover[]>;
/**
 * Pick a cover for a newsletter / News & Insight edition.
 * Prefers a theme match from the title, then unused recent covers, then any cover.
 * URLs are Firebase Storage public links.
 */
export declare const pickNewsletterCover: (input?: {
    title?: string;
    excerpt?: string;
    overrideUrl?: string;
}) => Promise<NewsletterCover>;
export declare const embedNewsletterCoverInContent: (content: string, cover: NewsletterCover, title: string) => string;
export declare const listNewsletterCovers: () => NewsletterCover[];
/** Persist Firebase cover URLs onto existing NewsInsight documents. */
export declare const migrateNewsInsightCoverUrls: () => Promise<{
    scanned: number;
    updated: number;
}>;
//# sourceMappingURL=newsletterCover.d.ts.map