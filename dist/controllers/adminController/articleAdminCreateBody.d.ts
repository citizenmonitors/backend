import type { Request } from "express";
export declare const buildNewsInsightCreatePayload: (req: Request) => Promise<{
    adminId: string | import("mongoose").Types.ObjectId | undefined;
    title: string;
    content: string;
    thumbnailUrl: string;
    heroImageUrl: string | undefined;
    excerpt: string | undefined;
    slug: string | undefined;
    publishedAt: string | Date | undefined;
    isPublished: unknown;
    notifySubscribers: unknown;
}>;
export declare const buildPressCoverageCreatePayload: (req: Request) => Promise<{
    adminId: string | import("mongoose").Types.ObjectId | undefined;
    title: string;
    content: string;
    thumbnailUrl: string;
    heroImageUrl: string | undefined;
    excerpt: string | undefined;
    dateline: string | undefined;
    slug: string | undefined;
    publishedAt: string | Date | undefined;
    isPublished: unknown;
    notifySubscribers: unknown;
}>;
//# sourceMappingURL=articleAdminCreateBody.d.ts.map