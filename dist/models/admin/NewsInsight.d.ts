import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    slug: string;
    title: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    content: string;
    thumbnailURLUrl: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    excerpt?: string | null | undefined;
    heroImageURL?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    slug: string;
    title: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    content: string;
    thumbnailURLUrl: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    excerpt?: string | null | undefined;
    heroImageURL?: string | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    slug: string;
    title: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    content: string;
    thumbnailURLUrl: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    excerpt?: string | null | undefined;
    heroImageURL?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    slug: string;
    title: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    content: string;
    thumbnailURLUrl: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    excerpt?: string | null | undefined;
    heroImageURL?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    slug: string;
    title: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    content: string;
    thumbnailURLUrl: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    excerpt?: string | null | undefined;
    heroImageURL?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    slug: string;
    title: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    content: string;
    thumbnailURLUrl: string;
    publishedAt: NativeDate;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    excerpt?: string | null | undefined;
    heroImageURL?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=NewsInsight.d.ts.map