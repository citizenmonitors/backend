export declare const listPublishedNewsInsightsMobile: (input?: {
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
        content: string;
        thumbnailURLUrl: string;
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
export declare const getPublishedNewsInsightBySlugMobile: (slug: string, viewerUserId?: string) => Promise<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | undefined;
    content: string;
    thumbnailURLUrl: string;
    heroImageURL: string;
    publishedAt: Date;
    isPublished: boolean;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
} | null>;
//# sourceMappingURL=newsInsightService.d.ts.map