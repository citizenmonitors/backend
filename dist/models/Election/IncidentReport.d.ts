import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    hidden: boolean;
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
    election: mongoose.Types.ObjectId;
    flagged: boolean;
    user: mongoose.Types.ObjectId;
    userRole: string;
    actions: mongoose.Types.DocumentArray<{
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }> & {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }>;
    agreed: boolean;
    selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
    incidentNote: string;
    incidentPictures: mongoose.Types.DocumentArray<{
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
    incidentVideos: mongoose.Types.DocumentArray<{
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
    uploadLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
        accuracy?: number | null | undefined;
        capturedAt?: NativeDate | null | undefined;
    } | null | undefined;
    priorityLevel?: number | null | undefined;
    electionRating?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    hidden: boolean;
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
    election: mongoose.Types.ObjectId;
    flagged: boolean;
    user: mongoose.Types.ObjectId;
    userRole: string;
    actions: mongoose.Types.DocumentArray<{
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }> & {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }>;
    agreed: boolean;
    selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
    incidentNote: string;
    incidentPictures: mongoose.Types.DocumentArray<{
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
    incidentVideos: mongoose.Types.DocumentArray<{
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
    uploadLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
        accuracy?: number | null | undefined;
        capturedAt?: NativeDate | null | undefined;
    } | null | undefined;
    priorityLevel?: number | null | undefined;
    electionRating?: string | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    hidden: boolean;
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
    election: mongoose.Types.ObjectId;
    flagged: boolean;
    user: mongoose.Types.ObjectId;
    userRole: string;
    actions: mongoose.Types.DocumentArray<{
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }> & {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }>;
    agreed: boolean;
    selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
    incidentNote: string;
    incidentPictures: mongoose.Types.DocumentArray<{
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
    incidentVideos: mongoose.Types.DocumentArray<{
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
    uploadLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
        accuracy?: number | null | undefined;
        capturedAt?: NativeDate | null | undefined;
    } | null | undefined;
    priorityLevel?: number | null | undefined;
    electionRating?: string | null | undefined;
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
    hidden: boolean;
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
    election: mongoose.Types.ObjectId;
    flagged: boolean;
    user: mongoose.Types.ObjectId;
    userRole: string;
    actions: mongoose.Types.DocumentArray<{
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }> & {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }>;
    agreed: boolean;
    selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
    incidentNote: string;
    incidentPictures: mongoose.Types.DocumentArray<{
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
    incidentVideos: mongoose.Types.DocumentArray<{
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
    uploadLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
        accuracy?: number | null | undefined;
        capturedAt?: NativeDate | null | undefined;
    } | null | undefined;
    priorityLevel?: number | null | undefined;
    electionRating?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    hidden: boolean;
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
    election: mongoose.Types.ObjectId;
    flagged: boolean;
    user: mongoose.Types.ObjectId;
    userRole: string;
    actions: mongoose.Types.DocumentArray<{
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }> & {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }>;
    agreed: boolean;
    selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
    incidentNote: string;
    incidentPictures: mongoose.Types.DocumentArray<{
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
    incidentVideos: mongoose.Types.DocumentArray<{
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
    uploadLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
        accuracy?: number | null | undefined;
        capturedAt?: NativeDate | null | undefined;
    } | null | undefined;
    priorityLevel?: number | null | undefined;
    electionRating?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    hidden: boolean;
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
    election: mongoose.Types.ObjectId;
    flagged: boolean;
    user: mongoose.Types.ObjectId;
    userRole: string;
    actions: mongoose.Types.DocumentArray<{
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }> & {
        action: "agree" | "flag";
        flagImage?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        flagVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userId?: mongoose.Types.ObjectId | null | undefined;
        flagReason?: string | null | undefined;
        evidenceId?: mongoose.Types.ObjectId | null | undefined;
    }>;
    agreed: boolean;
    selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
    incidentNote: string;
    incidentPictures: mongoose.Types.DocumentArray<{
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
    incidentVideos: mongoose.Types.DocumentArray<{
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
    uploadLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
        accuracy?: number | null | undefined;
        capturedAt?: NativeDate | null | undefined;
    } | null | undefined;
    priorityLevel?: number | null | undefined;
    electionRating?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=IncidentReport.d.ts.map