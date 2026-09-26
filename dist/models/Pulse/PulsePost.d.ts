import mongoose from "mongoose";
declare const PulsePost: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    visibilityScope: "state" | "lga" | "ward" | "all" | "polling-unit";
    repostCount: number;
    imageUrl?: string | null | undefined;
    audienceState?: string | null | undefined;
    audienceLga?: string | null | undefined;
    audienceWard?: string | null | undefined;
    audiencePollingUnit?: string | null | undefined;
    repostedFrom?: mongoose.Types.ObjectId | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    visibilityScope: "state" | "lga" | "ward" | "all" | "polling-unit";
    repostCount: number;
    imageUrl?: string | null | undefined;
    audienceState?: string | null | undefined;
    audienceLga?: string | null | undefined;
    audienceWard?: string | null | undefined;
    audiencePollingUnit?: string | null | undefined;
    repostedFrom?: mongoose.Types.ObjectId | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    visibilityScope: "state" | "lga" | "ward" | "all" | "polling-unit";
    repostCount: number;
    imageUrl?: string | null | undefined;
    audienceState?: string | null | undefined;
    audienceLga?: string | null | undefined;
    audienceWard?: string | null | undefined;
    audiencePollingUnit?: string | null | undefined;
    repostedFrom?: mongoose.Types.ObjectId | null | undefined;
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
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    visibilityScope: "state" | "lga" | "ward" | "all" | "polling-unit";
    repostCount: number;
    imageUrl?: string | null | undefined;
    audienceState?: string | null | undefined;
    audienceLga?: string | null | undefined;
    audienceWard?: string | null | undefined;
    audiencePollingUnit?: string | null | undefined;
    repostedFrom?: mongoose.Types.ObjectId | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    visibilityScope: "state" | "lga" | "ward" | "all" | "polling-unit";
    repostCount: number;
    imageUrl?: string | null | undefined;
    audienceState?: string | null | undefined;
    audienceLga?: string | null | undefined;
    audienceWard?: string | null | undefined;
    audiencePollingUnit?: string | null | undefined;
    repostedFrom?: mongoose.Types.ObjectId | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
    visibilityScope: "state" | "lga" | "ward" | "all" | "polling-unit";
    repostCount: number;
    imageUrl?: string | null | undefined;
    audienceState?: string | null | undefined;
    audienceLga?: string | null | undefined;
    audienceWard?: string | null | undefined;
    audiencePollingUnit?: string | null | undefined;
    repostedFrom?: mongoose.Types.ObjectId | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default PulsePost;
//# sourceMappingURL=PulsePost.d.ts.map