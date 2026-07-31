export type ArticleNotificationLink = {
    slug?: string;
    articleId?: string;
};
export declare const defaultNotificationSubtitle: (type?: string | null) => string;
/** Detect legacy JSON stored in `info` for article deep links. */
export declare const parseArticleLinkFromInfo: (info?: string | null) => ArticleNotificationLink | null;
/**
 * Make notification `info` safe for push/inbox display.
 * Strips raw media URLs (legacy flag evidence dumps) and keeps human text.
 */
export declare const sanitizeNotificationSubtitle: (info?: string | null) => string;
export declare const resolveNotificationDisplay: (input: {
    type?: string | null;
    body?: string | null;
    info?: string | null;
    articleSlug?: string | null;
    articleId?: string | null;
}) => {
    title: string;
    subtitle: string;
    link: ArticleNotificationLink | null;
};
//# sourceMappingURL=notificationContent.d.ts.map