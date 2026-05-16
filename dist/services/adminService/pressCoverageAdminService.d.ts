import mongoose from "mongoose";
import type { Types } from "mongoose";
type Id = string | Types.ObjectId;
export type CreatePressCoverageInput = {
    adminId: Id | undefined;
    title: string;
    content: string;
    thumbnail: string;
    heroImageURL?: string;
    excerpt?: string;
    dateline?: string;
    slug?: string;
    publishedAt?: Date | string;
    isPublished?: unknown;
    notifySubscribers?: unknown;
};
export declare const createPressCoverageArticle: (input: CreatePressCoverageInput) => Promise<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    slug: string;
    thumbnail: string;
    title: string;
    content: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: Types.ObjectId;
    likes: Types.DocumentArray<{
        user: Types.ObjectId;
    }, Types.Subdocument<Types.ObjectId, any, {
        user: Types.ObjectId;
    }> & {
        user: Types.ObjectId;
    }>;
    heroImageURL?: string | null | undefined;
    excerpt?: string | null | undefined;
    dateline?: string | null | undefined;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const listPressCoverageForAdmin: (input?: {
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
        thumbnail: string;
        title: string;
        content: string;
        publishedAt: NativeDate;
        isPublished: boolean;
        createdBy: Types.ObjectId;
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
        heroImageURL?: string | null | undefined;
        excerpt?: string | null | undefined;
        dateline?: string | null | undefined;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const getPressCoverageByIdForAdmin: (articleId: string) => Promise<mongoose.FlattenMaps<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
    slug: string;
    thumbnail: string;
    title: string;
    content: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: Types.ObjectId;
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
    heroImageURL?: string | null | undefined;
    excerpt?: string | null | undefined;
    dateline?: string | null | undefined;
}> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
//# sourceMappingURL=pressCoverageAdminService.d.ts.map