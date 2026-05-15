export declare const countCommentsForPressCoverageArticles: (articleIds: string[]) => Promise<Map<string, number>>;
export declare const listPublishedPressCoverageMobile: (input?: {
    page?: number;
    limit?: number;
    viewerUserId?: string;
}) => Promise<{
    total: number;
    page: number;
    limit: number;
    items: {
        id: string;
        slug: string;
        title: string;
        thumbnail: string;
        summary: string;
        publishedAt: NativeDate;
        dateline: string | undefined;
        likesCount: number;
        commentsCount: number;
        isLikedByCurrentUser: boolean;
    }[];
}>;
export declare const getPublishedPressCoverageBySlugMobile: (slug: string, viewerUserId?: string) => Promise<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    dateline: string | undefined;
    content: string;
    thumbnail: string;
    heroImage: string;
    publishedAt: NativeDate;
    createdAt: NativeDate;
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
} | null>;
//# sourceMappingURL=pressCoverageService.d.ts.map