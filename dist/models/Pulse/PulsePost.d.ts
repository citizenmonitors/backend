import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    visibilityScope: "lga" | "ward";
    audienceState: string;
    audienceLga: string;
    imageUrl?: string | null | undefined;
    audienceWard?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    visibilityScope: "lga" | "ward";
    audienceState: string;
    audienceLga: string;
    imageUrl?: string | null | undefined;
    audienceWard?: string | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    visibilityScope: "lga" | "ward";
    audienceState: string;
    audienceLga: string;
    imageUrl?: string | null | undefined;
    audienceWard?: string | null | undefined;
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
    body: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    visibilityScope: "lga" | "ward";
    audienceState: string;
    audienceLga: string;
    imageUrl?: string | null | undefined;
    audienceWard?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    visibilityScope: "lga" | "ward";
    audienceState: string;
    audienceLga: string;
    imageUrl?: string | null | undefined;
    audienceWard?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    visibilityScope: "lga" | "ward";
    audienceState: string;
    audienceLga: string;
    imageUrl?: string | null | undefined;
    audienceWard?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=PulsePost.d.ts.map