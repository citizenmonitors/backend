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
        thumbnailUrl: string;
        summary: string;
        publishedAt: NativeDate;
        likesCount: number;
        commentsCount: number;
        isLikedByCurrentUser: boolean;
    }[];
}>;
export declare const getPublishedNewsInsightBySlugMobile: (slug: string, viewerUserId?: string) => Promise<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    thumbnailUrl: string;
    heroImageUrl: string;
    publishedAt: NativeDate;
    createdAt: NativeDate;
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
} | null>;
//# sourceMappingURL=newsInsightService.d.ts.map