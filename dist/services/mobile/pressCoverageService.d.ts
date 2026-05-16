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
        excerpt: string | undefined;
        dateline: string | undefined;
        content: string;
        thumbnail: string;
        heroImageURL: string;
        publishedAt: Date;
        isPublished: boolean;
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
        likesCount: number;
        commentsCount: number;
        isLikedByCurrentUser: boolean;
    }[];
}>;
export declare const getPublishedPressCoverageBySlugMobile: (slug: string, viewerUserId?: string) => Promise<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | undefined;
    dateline: string | undefined;
    content: string;
    thumbnail: string;
    heroImageURL: string;
    publishedAt: Date;
    isPublished: boolean;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
} | null>;
//# sourceMappingURL=pressCoverageService.d.ts.map