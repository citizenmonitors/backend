import mongoose from "mongoose";
import type { Types } from "mongoose";
type Id = string | Types.ObjectId;
type UserSummaryLean = {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
};
/** Labels from ActiveElection lean row with populated `election`. */
export declare function getPopulatedElectionLabels(active: {
    election?: unknown;
} | null | undefined): {
    type: string;
    name: string;
};
export declare function userSummaryFromLean(user: unknown): UserSummaryLean | undefined;
export declare const getDashboardDataService: () => Promise<{
    totalRegisteresUSers: number;
    totalObserverUsers: number;
    totalActiveUsers: (mongoose.Document<unknown, {}, {
        month: string;
        users: Types.ObjectId[];
    }> & {
        month: string;
        users: Types.ObjectId[];
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
    totalResultsUploaded: number;
    userInfo: {
        gender: {
            male: number;
            female: number;
        };
        role: {
            observer: number;
            volunteer: number;
        };
    };
    dailyTraffic: (mongoose.Document<unknown, {}, {
        date: NativeDate;
        visitCount: number;
    }> & {
        date: NativeDate;
        visitCount: number;
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const getAllAdminService: () => Promise<(mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    isObserverInPollingUnit: boolean;
    pendingObserverVerification: boolean;
    password: string;
    hasSubmittedRoleForm: boolean;
    hasSetPassword: boolean;
    useAnonymousIdentity: boolean;
    coverageUpdateCount: number;
    observerId: Types.DocumentArray<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }, Types.Subdocument<Types.ObjectId, any, {
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
    role?: "observer" | "volunteer" | "public-viewer" | "admin" | "super-admin" | null | undefined;
    pendingEmail?: string | null | undefined;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    gender?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    nationality?: string | null | undefined;
    profileImage?: {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    } | null | undefined;
    state?: string | null | undefined;
    lga?: string | null | undefined;
    ward?: string | null | undefined;
    pollingUnit?: string | null | undefined;
    isRegisteredVoter?: boolean | null | undefined;
    isPoliticalPartyMember?: boolean | null | undefined;
    isElectionWitnessReady?: boolean | null | undefined;
    isOpenToSurvey?: boolean | null | undefined;
    whyYouJoinUs?: string | null | undefined;
    phoneNumber?: string | null | undefined;
    bankName?: string | null | undefined;
    bankAccountNumber?: string | null | undefined;
    bankAccountName?: string | null | undefined;
    resetPasswordOTP?: string | null | undefined;
    resetPasswordOTPExpires?: NativeDate | null | undefined;
    verificationCode?: string | null | undefined;
    verificationCodeExpires?: NativeDate | null | undefined;
    mobileMeta?: {
        platform?: string | null | undefined;
        deviceId?: string | null | undefined;
        appVersion?: string | null | undefined;
        pushToken?: string | null | undefined;
        lastLoginAt?: NativeDate | null | undefined;
    } | null | undefined;
    authProviders?: {
        google?: {
            googleId?: string | null | undefined;
            emailVerified?: boolean | null | undefined;
            linkedAt?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    isActive?: boolean | null | undefined;
    lastLogin?: NativeDate | null | undefined;
    resetPasswordToken?: string | null | undefined;
    resetPasswordExpires?: NativeDate | null | undefined;
    anonymousUsername?: string | null | undefined;
    adminPermissions?: Types.ObjectId | null | undefined;
    notifications?: {
        email?: {
            inbox: boolean;
            election: boolean;
            newsletter: boolean;
        } | null | undefined;
        mobile?: {
            newsletter: boolean;
            pollingUnitActivity: boolean;
            electionDayAlert: boolean;
            discussionReplies: boolean;
            resultAggregated: boolean;
            reportConfirmed: boolean;
            reportFlagged: boolean;
            securityAlerts: boolean;
            newsAndInsights: boolean;
            pressCoverage: boolean;
        } | null | undefined;
    } | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    isObserverInPollingUnit: boolean;
    pendingObserverVerification: boolean;
    password: string;
    hasSubmittedRoleForm: boolean;
    hasSetPassword: boolean;
    useAnonymousIdentity: boolean;
    coverageUpdateCount: number;
    observerId: Types.DocumentArray<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }, Types.Subdocument<Types.ObjectId, any, {
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
    role?: "observer" | "volunteer" | "public-viewer" | "admin" | "super-admin" | null | undefined;
    pendingEmail?: string | null | undefined;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    gender?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    nationality?: string | null | undefined;
    profileImage?: {
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    } | null | undefined;
    state?: string | null | undefined;
    lga?: string | null | undefined;
    ward?: string | null | undefined;
    pollingUnit?: string | null | undefined;
    isRegisteredVoter?: boolean | null | undefined;
    isPoliticalPartyMember?: boolean | null | undefined;
    isElectionWitnessReady?: boolean | null | undefined;
    isOpenToSurvey?: boolean | null | undefined;
    whyYouJoinUs?: string | null | undefined;
    phoneNumber?: string | null | undefined;
    bankName?: string | null | undefined;
    bankAccountNumber?: string | null | undefined;
    bankAccountName?: string | null | undefined;
    resetPasswordOTP?: string | null | undefined;
    resetPasswordOTPExpires?: NativeDate | null | undefined;
    verificationCode?: string | null | undefined;
    verificationCodeExpires?: NativeDate | null | undefined;
    mobileMeta?: {
        platform?: string | null | undefined;
        deviceId?: string | null | undefined;
        appVersion?: string | null | undefined;
        pushToken?: string | null | undefined;
        lastLoginAt?: NativeDate | null | undefined;
    } | null | undefined;
    authProviders?: {
        google?: {
            googleId?: string | null | undefined;
            emailVerified?: boolean | null | undefined;
            linkedAt?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    isActive?: boolean | null | undefined;
    lastLogin?: NativeDate | null | undefined;
    resetPasswordToken?: string | null | undefined;
    resetPasswordExpires?: NativeDate | null | undefined;
    anonymousUsername?: string | null | undefined;
    adminPermissions?: Types.ObjectId | null | undefined;
    notifications?: {
        email?: {
            inbox: boolean;
            election: boolean;
            newsletter: boolean;
        } | null | undefined;
        mobile?: {
            newsletter: boolean;
            pollingUnitActivity: boolean;
            electionDayAlert: boolean;
            discussionReplies: boolean;
            resultAggregated: boolean;
            reportConfirmed: boolean;
            reportFlagged: boolean;
            securityAlerts: boolean;
            newsAndInsights: boolean;
            pressCoverage: boolean;
        } | null | undefined;
    } | null | undefined;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
})[]>;
export declare const getAllResultService: () => Promise<({
    id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    election: string;
    electionName: string;
    state: string;
    lga: string;
    pictures: (mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & any[]) | mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>[];
    videos: (mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & any[]) | mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>[];
    createdAt: NativeDate;
    resultUploaded: string;
} | {
    id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    election: string;
    electionName: string;
    state: string;
    lga: string;
    pictures: Types.DocumentArray<mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>> & mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>>;
    videos: Types.DocumentArray<mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>> & mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>>;
    createdAt: NativeDate;
    resultUploaded: string;
})[]>;
export declare const getResultOrIncidentByIdService: (id: Id) => Promise<{
    result: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        hidden: boolean;
        state: string;
        lga: string;
        ward: string;
        pollingUnit: string;
        election: Types.ObjectId;
        user: Types.ObjectId;
        partiesVotes: Types.DocumentArray<mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>>;
        resultPicture?: mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> | null | undefined;
        resultVideo?: mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> | null | undefined;
        userRole?: string | null | undefined;
        uploadLocation?: mongoose.FlattenMaps<{
            latitude?: number | null | undefined;
            longitude?: number | null | undefined;
            address?: string | null | undefined;
            accuracy?: number | null | undefined;
            capturedAt?: NativeDate | null | undefined;
        }> | null | undefined;
        voteRating?: "good" | "okay" | "poor" | null | undefined;
        voterIntimidation?: "yes" | "no" | null | undefined;
        voteBuying?: "yes" | "no" | null | undefined;
        timeBegan?: string | null | undefined;
        accreditedVoters?: number | null | undefined;
        rejectedPapers?: number | null | undefined;
        spoiledBallotPapers?: number | null | undefined;
        usedBallotPapers?: number | null | undefined;
        priorityLevel?: number | null | undefined;
        _id: Types.ObjectId;
        __v: number;
        electionDetails: {
            election: string;
            electionName: string;
            startDate: NativeDate;
            endDate: NativeDate;
            mockElection: boolean;
            electionLocation: string | null | undefined;
        };
    };
    incident?: undefined;
} | {
    incident: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        hidden: boolean;
        state: string;
        lga: string;
        ward: string;
        pollingUnit: string;
        election: Types.ObjectId;
        user: Types.ObjectId;
        userRole: string;
        selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
        incidentNote: string;
        incidentPictures: Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        incidentVideos: Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        uploadLocation?: mongoose.FlattenMaps<{
            latitude?: number | null | undefined;
            longitude?: number | null | undefined;
            address?: string | null | undefined;
            accuracy?: number | null | undefined;
            capturedAt?: NativeDate | null | undefined;
        }> | null | undefined;
        priorityLevel?: number | null | undefined;
        electionRating?: string | null | undefined;
        _id: Types.ObjectId;
        __v: number;
        electionDetails: {
            election: string;
            electionName: string;
            startDate: NativeDate;
            endDate: NativeDate;
            mockElection: boolean;
            electionLocation: string | null | undefined;
        };
    };
    result?: undefined;
}>;
export declare const deleteResultOrIncidentService: (id: Id, adminId: Id) => Promise<{
    message: string;
}>;
export declare const getFlaggedResultsService: () => Promise<({
    id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    election: string;
    electionName: string;
    state: string;
    lga: string;
    pollingUnit: string;
    flagged: boolean;
    priorityLevel: number | null | undefined;
    pictures: (mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & any[]) | mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>[];
    videos: (mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }> & any[]) | mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>[];
    createdAt: NativeDate;
    resultUploaded: string;
    hidden?: undefined;
} | {
    id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    election: string;
    electionName: string;
    state: string;
    lga: string;
    pollingUnit: string;
    flagged: boolean;
    hidden: boolean;
    priorityLevel: number | null | undefined;
    pictures: never[] | Types.DocumentArray<mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>> & mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>>;
    videos: never[] | Types.DocumentArray<mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>> & mongoose.FlattenMaps<{
        name?: string | null | undefined;
        type?: string | null | undefined;
        url?: string | null | undefined;
        location?: string | null | undefined;
        size?: number | null | undefined;
    }>>;
    createdAt: NativeDate;
    resultUploaded: string;
})[]>;
export declare const deleteFlaggedResults: (id: Id, adminId: Id) => Promise<{
    message: string;
    results: ({
        id: Types.ObjectId;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        election: string;
        electionName: string;
        state: string;
        lga: string;
        pollingUnit: string;
        flagged: boolean;
        priorityLevel: number | null | undefined;
        pictures: (mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> & any[]) | mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>[];
        videos: (mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> & any[]) | mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>[];
        createdAt: NativeDate;
        resultUploaded: string;
        hidden?: undefined;
    } | {
        id: Types.ObjectId;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        election: string;
        electionName: string;
        state: string;
        lga: string;
        pollingUnit: string;
        flagged: boolean;
        hidden: boolean;
        priorityLevel: number | null | undefined;
        pictures: never[] | Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        videos: never[] | Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        createdAt: NativeDate;
        resultUploaded: string;
    })[];
}>;
export declare const restoreFlaggedResult: (id: Id, adminId: Id) => Promise<{
    message: string;
    results: ({
        id: Types.ObjectId;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        election: string;
        electionName: string;
        state: string;
        lga: string;
        pollingUnit: string;
        flagged: boolean;
        priorityLevel: number | null | undefined;
        pictures: (mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> & any[]) | mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>[];
        videos: (mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> & any[]) | mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>[];
        createdAt: NativeDate;
        resultUploaded: string;
        hidden?: undefined;
    } | {
        id: Types.ObjectId;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        election: string;
        electionName: string;
        state: string;
        lga: string;
        pollingUnit: string;
        flagged: boolean;
        hidden: boolean;
        priorityLevel: number | null | undefined;
        pictures: never[] | Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        videos: never[] | Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        createdAt: NativeDate;
        resultUploaded: string;
    })[];
}>;
export declare const getSingleFlaggedElectionService: (id: Id) => Promise<{
    result: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        hidden: boolean;
        state: string;
        lga: string;
        ward: string;
        pollingUnit: string;
        election: Types.ObjectId;
        flagged: boolean;
        user: Types.ObjectId;
        partiesVotes: Types.DocumentArray<mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>>;
        resultPicture?: mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> | null | undefined;
        resultVideo?: mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> | null | undefined;
        userRole?: string | null | undefined;
        uploadLocation?: mongoose.FlattenMaps<{
            latitude?: number | null | undefined;
            longitude?: number | null | undefined;
            address?: string | null | undefined;
            accuracy?: number | null | undefined;
            capturedAt?: NativeDate | null | undefined;
        }> | null | undefined;
        voteRating?: "good" | "okay" | "poor" | null | undefined;
        voterIntimidation?: "yes" | "no" | null | undefined;
        voteBuying?: "yes" | "no" | null | undefined;
        timeBegan?: string | null | undefined;
        accreditedVoters?: number | null | undefined;
        rejectedPapers?: number | null | undefined;
        spoiledBallotPapers?: number | null | undefined;
        usedBallotPapers?: number | null | undefined;
        priorityLevel?: number | null | undefined;
        _id: Types.ObjectId;
        __v: number;
        electionDetails: {
            election: string;
            electionName: string;
            startDate: NativeDate;
            endDate: NativeDate;
            mockElection: boolean;
            electionLocation: string | null | undefined;
        };
    };
    counterEvidence: {
        id: Types.ObjectId;
        state: string;
        lga: string;
        ward: string;
        pollingUnit: string;
        partiesVotes: Types.DocumentArray<mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>>;
        accreditedVoters: number | null | undefined;
        rejectedPapers: number | null | undefined;
        spoiledBallotPapers: number | null | undefined;
        usedBallotPapers: number | null | undefined;
        resultPicture: mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> | null | undefined;
        resultVideo: mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }> | null | undefined;
        flagged: boolean;
        hidden: boolean;
        priorityLevel: number | null | undefined;
    }[];
    incident?: undefined;
} | {
    incident: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        hidden: boolean;
        state: string;
        lga: string;
        ward: string;
        pollingUnit: string;
        election: Types.ObjectId;
        flagged: boolean;
        user: Types.ObjectId;
        userRole: string;
        selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
        incidentNote: string;
        incidentPictures: Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        incidentVideos: Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        uploadLocation?: mongoose.FlattenMaps<{
            latitude?: number | null | undefined;
            longitude?: number | null | undefined;
            address?: string | null | undefined;
            accuracy?: number | null | undefined;
            capturedAt?: NativeDate | null | undefined;
        }> | null | undefined;
        priorityLevel?: number | null | undefined;
        electionRating?: string | null | undefined;
        _id: Types.ObjectId;
        __v: number;
        electionDetails: {
            election: string;
            electionName: string;
            startDate: NativeDate;
            endDate: NativeDate;
            mockElection: boolean;
            electionLocation: string | null | undefined;
        };
    };
    counterEvidence: {
        id: Types.ObjectId;
        state: string;
        lga: string;
        ward: string;
        pollingUnit: string;
        selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
        incidentNote: string;
        electionRating: string | null | undefined;
        incidentPictures: Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        incidentVideos: Types.DocumentArray<mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>, Types.Subdocument<Types.ObjectId, any, mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>> & mongoose.FlattenMaps<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }>>;
        flagged: boolean;
        hidden: boolean;
        priorityLevel: number | null | undefined;
    }[];
    result?: undefined;
}>;
export declare const adminNotificationService: (userId: Id) => Promise<{
    read: boolean;
    createdAt: NativeDate;
    targetUsers: Types.ObjectId[];
    deletedBy: Types.ObjectId[];
    type?: "newsletter" | "election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert" | "pending-approval" | "discussion-reply" | "news-insight" | "press-coverage" | null | undefined;
    info?: string | null | undefined;
    activeElectionId?: Types.ObjectId | null | undefined;
    preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
    body?: string | null | undefined;
    articleSlug?: string | null | undefined;
    articleId?: string | null | undefined;
    recipients?: string[] | null | undefined;
    _id: Types.ObjectId;
    __v: number;
}[]>;
export declare const markNotificationAsReadService: (notificationId: Id, userId: Id) => Promise<{
    message: string;
}>;
export declare const deleteNotificationForUserService: (notificationId: Id, userId: Id) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=adminElectionService.d.ts.map