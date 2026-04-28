import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
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
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    body: string;
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
    likes: mongoose.Types.DocumentArray<{
        user: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        user: mongoose.Types.ObjectId;
    }> & {
        user: mongoose.Types.ObjectId;
    }>;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=CollationReportComment.d.ts.map