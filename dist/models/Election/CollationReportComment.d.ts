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
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
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
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
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
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
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
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
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
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
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
    activeElection: mongoose.Types.ObjectId;
    targetType: "election_result" | "incident_report";
    targetId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    useAnonymousDisplay: boolean;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=CollationReportComment.d.ts.map