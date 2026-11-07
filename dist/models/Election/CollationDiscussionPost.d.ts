import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    body: string;
    activeElection: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    imageUrls: string[];
    videoUrls: string[];
    allowSocialShare: boolean;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    body: string;
    activeElection: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    imageUrls: string[];
    videoUrls: string[];
    allowSocialShare: boolean;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    body: string;
    activeElection: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    imageUrls: string[];
    videoUrls: string[];
    allowSocialShare: boolean;
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
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    body: string;
    activeElection: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    imageUrls: string[];
    videoUrls: string[];
    allowSocialShare: boolean;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    body: string;
    activeElection: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    imageUrls: string[];
    videoUrls: string[];
    allowSocialShare: boolean;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    body: string;
    activeElection: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    imageUrls: string[];
    videoUrls: string[];
    allowSocialShare: boolean;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=CollationDiscussionPost.d.ts.map