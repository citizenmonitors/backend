export type ArticleNotificationLink = {
    slug?: string;
    articleId?: string;
};
export declare const defaultNotificationSubtitle: (type?: string | null) => string;
/** Detect legacy JSON stored in `info` for article deep links. */
export declare const parseArticleLinkFromInfo: (info?: string | null) => ArticleNotificationLink | null;
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