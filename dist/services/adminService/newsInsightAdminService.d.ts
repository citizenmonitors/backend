import mongoose from "mongoose";
import type { Types } from "mongoose";
type Id = string | Types.ObjectId;
export type CreateNewsInsightInput = {
    adminId: Id | undefined;
    title: string;
    content: string;
    thumbnailURLUrl: string;
    heroImageURL?: string;
    excerpt?: string;
    slug?: string;
    publishedAt?: Date | string;
    isPublished?: unknown;
    notifySubscribers?: unknown;
};
export declare const createNewsInsightArticle: (input: CreateNewsInsightInput) => Promise<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    slug: string;
    title: string;
    likes: Types.DocumentArray<{
        user: Types.ObjectId;
    }, Types.Subdocument<Types.ObjectId, any, {
        user: Types.ObjectId;
    }> & {
        user: Types.ObjectId;
    }>;
    content: string;
    thumbnailURLUrl: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: Types.ObjectId;
    excerpt?: string | null | undefined;
    heroImageURL?: string | null | undefined;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const listNewsInsightsForAdmin: (input?: {
    page?: number;
    limit?: number;
}) => Promise<{
    total: number;
    page: number;
    limit: number;
    items: (mongoose.FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
        slug: string;
        title: string;
        likes: Types.DocumentArray<{
            user: Types.ObjectId;
        } | {
            user: string;
            _id: string;
            __v: number;
        }, Types.Subdocument<string | Types.ObjectId, any, {
            user: Types.ObjectId;
        } | {
            user: string;
            _id: string;
            __v: number;
        }> & ({
            user: Types.ObjectId;
        } | {
            user: string;
            _id: string;
            __v: number;
        })>;
        content: string;
        thumbnailURLUrl: string;
        publishedAt: NativeDate;
        isPublished: boolean;
        createdBy: Types.ObjectId;
        excerpt?: string | null | undefined;
        heroImageURL?: string | null | undefined;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const getNewsInsightByIdForAdmin: (articleId: string) => Promise<mongoose.FlattenMaps<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
    slug: string;
    title: string;
    likes: Types.DocumentArray<{
        user: Types.ObjectId;
    } | {
        user: string;
        _id: string;
        __v: number;
    }, Types.Subdocument<string | Types.ObjectId, any, {
        user: Types.ObjectId;
    } | {
        user: string;
        _id: string;
        __v: number;
    }> & ({
        user: Types.ObjectId;
    } | {
        user: string;
        _id: string;
        __v: number;
    })>;
    content: string;
    thumbnailURLUrl: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: Types.ObjectId;
    excerpt?: string | null | undefined;
    heroImageURL?: string | null | undefined;
}> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
//# sourceMappingURL=newsInsightAdminService.d.ts.map