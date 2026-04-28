import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    election: mongoose.Types.ObjectId;
    startDate: NativeDate;
    endDate: NativeDate;
    results: mongoose.Types.ObjectId[];
    incidentReports: mongoose.Types.ObjectId[];
    resultsCount: number;
    politicalParties: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }> & {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }>;
    mockElection: boolean;
    electionLocation?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    election: mongoose.Types.ObjectId;
    startDate: NativeDate;
    endDate: NativeDate;
    results: mongoose.Types.ObjectId[];
    incidentReports: mongoose.Types.ObjectId[];
    resultsCount: number;
    politicalParties: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }> & {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }>;
    mockElection: boolean;
    electionLocation?: string | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    election: mongoose.Types.ObjectId;
    startDate: NativeDate;
    endDate: NativeDate;
    results: mongoose.Types.ObjectId[];
    incidentReports: mongoose.Types.ObjectId[];
    resultsCount: number;
    politicalParties: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }> & {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }>;
    mockElection: boolean;
    electionLocation?: string | null | undefined;
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
    election: mongoose.Types.ObjectId;
    startDate: NativeDate;
    endDate: NativeDate;
    results: mongoose.Types.ObjectId[];
    incidentReports: mongoose.Types.ObjectId[];
    resultsCount: number;
    politicalParties: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }> & {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }>;
    mockElection: boolean;
    electionLocation?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    election: mongoose.Types.ObjectId;
    startDate: NativeDate;
    endDate: NativeDate;
    results: mongoose.Types.ObjectId[];
    incidentReports: mongoose.Types.ObjectId[];
    resultsCount: number;
    politicalParties: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }> & {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }>;
    mockElection: boolean;
    electionLocation?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    election: mongoose.Types.ObjectId;
    startDate: NativeDate;
    endDate: NativeDate;
    results: mongoose.Types.ObjectId[];
    incidentReports: mongoose.Types.ObjectId[];
    resultsCount: number;
    politicalParties: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }> & {
        name?: string | null | undefined;
        code?: string | null | undefined;
        imageUrl?: string | null | undefined;
    }>;
    mockElection: boolean;
    electionLocation?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=ActiveElection.d.ts.map