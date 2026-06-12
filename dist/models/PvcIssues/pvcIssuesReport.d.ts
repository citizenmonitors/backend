import mongoose from "mongoose";
export declare const PVC_ISSUE_TYPES: readonly ["Marked as 'Unknown' in the voters roll despite valid registration", "PVC not available at collection centre", "PVC collection point inaccessible / unreasonably far", "Biometric data mismatch or capture failure", "Registration completed but PVC never issued", "PVC defaced or damaged", "Other"];
export type PvcIssueType = (typeof PVC_ISSUE_TYPES)[number];
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    description: string;
    email: string;
    state: string;
    lga: string;
    pollingUnit: string;
    phoneNumber: string;
    fullName: string;
    issueType: "Other" | "Marked as 'Unknown' in the voters roll despite valid registration" | "PVC not available at collection centre" | "PVC collection point inaccessible / unreasonably far" | "Biometric data mismatch or capture failure" | "Registration completed but PVC never issued" | "PVC defaced or damaged";
    otherIssueDetail: string;
    evidence: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>;
    consentGiven: boolean;
    consentText: string;
    consentedAt: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    description: string;
    email: string;
    state: string;
    lga: string;
    pollingUnit: string;
    phoneNumber: string;
    fullName: string;
    issueType: "Other" | "Marked as 'Unknown' in the voters roll despite valid registration" | "PVC not available at collection centre" | "PVC collection point inaccessible / unreasonably far" | "Biometric data mismatch or capture failure" | "Registration completed but PVC never issued" | "PVC defaced or damaged";
    otherIssueDetail: string;
    evidence: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>;
    consentGiven: boolean;
    consentText: string;
    consentedAt: NativeDate;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    description: string;
    email: string;
    state: string;
    lga: string;
    pollingUnit: string;
    phoneNumber: string;
    fullName: string;
    issueType: "Other" | "Marked as 'Unknown' in the voters roll despite valid registration" | "PVC not available at collection centre" | "PVC collection point inaccessible / unreasonably far" | "Biometric data mismatch or capture failure" | "Registration completed but PVC never issued" | "PVC defaced or damaged";
    otherIssueDetail: string;
    evidence: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>;
    consentGiven: boolean;
    consentText: string;
    consentedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    description: string;
    email: string;
    state: string;
    lga: string;
    pollingUnit: string;
    phoneNumber: string;
    fullName: string;
    issueType: "Other" | "Marked as 'Unknown' in the voters roll despite valid registration" | "PVC not available at collection centre" | "PVC collection point inaccessible / unreasonably far" | "Biometric data mismatch or capture failure" | "Registration completed but PVC never issued" | "PVC defaced or damaged";
    otherIssueDetail: string;
    evidence: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>;
    consentGiven: boolean;
    consentText: string;
    consentedAt: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    description: string;
    email: string;
    state: string;
    lga: string;
    pollingUnit: string;
    phoneNumber: string;
    fullName: string;
    issueType: "Other" | "Marked as 'Unknown' in the voters roll despite valid registration" | "PVC not available at collection centre" | "PVC collection point inaccessible / unreasonably far" | "Biometric data mismatch or capture failure" | "Registration completed but PVC never issued" | "PVC defaced or damaged";
    otherIssueDetail: string;
    evidence: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>;
    consentGiven: boolean;
    consentText: string;
    consentedAt: NativeDate;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    description: string;
    email: string;
    state: string;
    lga: string;
    pollingUnit: string;
    phoneNumber: string;
    fullName: string;
    issueType: "Other" | "Marked as 'Unknown' in the voters roll despite valid registration" | "PVC not available at collection centre" | "PVC collection point inaccessible / unreasonably far" | "Biometric data mismatch or capture failure" | "Registration completed but PVC never issued" | "PVC defaced or damaged";
    otherIssueDetail: string;
    evidence: mongoose.Types.DocumentArray<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>;
    consentGiven: boolean;
    consentText: string;
    consentedAt: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=pvcIssuesReport.d.ts.map