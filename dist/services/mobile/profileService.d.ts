import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
type ProfileUpdateFile = {
    profileImage?: {
        buffer: Buffer;
        mimetype: string;
        originalname: string;
        size: number;
    };
};
type ObserverUpgradePayload = {
    email: string;
    details: Record<string, unknown>;
    files: {
        "observerId[]"?: Array<{
            buffer: Buffer;
            mimetype: string;
            originalname: string;
            size: number;
        }>;
    };
};
type ObserverDataFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
};
type MobileNotificationSettings = {
    pollingUnitActivity?: boolean;
    electionDayAlert?: boolean;
    discussionReplies?: boolean;
    resultAggregated?: boolean;
    reportConfirmed?: boolean;
    reportFlagged?: boolean;
    securityAlerts?: boolean;
    newsletter?: boolean;
    newsAndInsights?: boolean;
    pressCoverage?: boolean;
};
type PollingUnitDetail = {
    id?: string;
    name?: string;
    [key: string]: unknown;
};
export declare const getMobileProfile: (userId: Id) => Promise<{
    notifications: {
        mobile: {
            pollingUnitActivity: boolean;
            electionDayAlert: boolean;
            discussionReplies: boolean;
            resultAggregated: boolean;
            reportConfirmed: boolean;
            reportFlagged: boolean;
            securityAlerts: boolean;
            newsletter: boolean;
            newsAndInsights: boolean;
            pressCoverage: boolean;
        };
    };
}>;
export declare const updateMobileProfile: (userId: Id, updateData: Record<string, unknown>, file?: ProfileUpdateFile | null) => Promise<Record<string, unknown>>;
export declare const updateMobilePassword: (userId: Id, currentPassword: string, newPassword: string, confirmPassword: string) => Promise<Record<string, unknown>>;
export declare const upgradeVolunteerToObserver: ({ email, details, files, }: ObserverUpgradePayload) => Promise<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
    email: string;
    isObserverInPollingUnit: boolean;
    pendingObserverVerification: boolean;
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
        deviceId?: string | null | undefined;
        platform?: string | null | undefined;
        appVersion?: string | null | undefined;
        pushToken?: string | null | undefined;
        lastLoginAt?: NativeDate | null | undefined;
        legacyExpoExperienceId?: string | null | undefined;
        legacyExpoDetectedAt?: NativeDate | null | undefined;
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
            election: boolean;
            inbox: boolean;
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
    _id: Types.ObjectId;
    __v: number;
}>;
export declare const upgradePublicViewerToVolunteer: (userId: Id) => Promise<Record<string, unknown>>;
export declare const upsertObserverProfileData: (input: {
    userId: Id;
    phoneNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    observerIdFiles?: ObserverDataFile[];
    replaceObserverIds?: boolean;
}) => Promise<Record<string, unknown>>;
export declare const getElectionVault: (userId: Id) => Promise<{
    summary: {
        totalSubmissions: number;
        resultsUploaded: number;
        incidentsUploaded: number;
    };
    results: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
        hidden: boolean;
        election: Types.ObjectId;
        state: string;
        lga: string;
        ward: string;
        pollingUnit: string;
        flagged: boolean;
        uploaderDeleted: boolean;
        partiesVotes: Types.DocumentArray<{
            party?: string | null | undefined;
            count?: number | null | undefined;
        }, Types.Subdocument<Types.ObjectId, any, {
            party?: string | null | undefined;
            count?: number | null | undefined;
        }> & {
            party?: string | null | undefined;
            count?: number | null | undefined;
        }>;
        actions: Types.DocumentArray<{
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
            userId?: Types.ObjectId | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: Types.ObjectId | null | undefined;
        } | {
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
            userId?: string | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: string | null | undefined;
            _id: string;
            __v: number;
        }, Types.Subdocument<string | Types.ObjectId, any, {
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
            userId?: Types.ObjectId | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: Types.ObjectId | null | undefined;
        } | {
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
            userId?: string | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: string | null | undefined;
            _id: string;
            __v: number;
        }> & ({
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
            userId?: Types.ObjectId | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: Types.ObjectId | null | undefined;
        } | {
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
            userId?: string | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: string | null | undefined;
            _id: string;
            __v: number;
        })>;
        agreed: boolean;
        user?: Types.ObjectId | null | undefined;
        resultPicture?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        resultVideo?: {
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        } | null | undefined;
        userRole?: string | null | undefined;
        uploadLocation?: {
            latitude?: number | null | undefined;
            longitude?: number | null | undefined;
            address?: string | null | undefined;
            accuracy?: number | null | undefined;
            capturedAt?: NativeDate | null | undefined;
        } | null | undefined;
        voteRating?: "good" | "okay" | "poor" | null | undefined;
        voterIntimidation?: "yes" | "no" | null | undefined;
        voteBuying?: "yes" | "no" | null | undefined;
        timeBegan?: string | null | undefined;
        accreditedVoters?: number | null | undefined;
        rejectedPapers?: number | null | undefined;
        spoiledBallotPapers?: number | null | undefined;
        usedBallotPapers?: number | null | undefined;
        priorityLevel?: number | null | undefined;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
    incidents: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
        hidden: boolean;
        election: Types.ObjectId;
        state: string;
        lga: string;
        ward: string;
        pollingUnit: string;
        flagged: boolean;
        uploaderDeleted: boolean;
        userRole: string;
        actions: Types.DocumentArray<{
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
            userId?: Types.ObjectId | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: Types.ObjectId | null | undefined;
        } | {
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
            userId?: string | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: string | null | undefined;
            _id: string;
            __v: number;
        }, Types.Subdocument<string | Types.ObjectId, any, {
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
            userId?: Types.ObjectId | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: Types.ObjectId | null | undefined;
        } | {
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
            userId?: string | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: string | null | undefined;
            _id: string;
            __v: number;
        }> & ({
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
            userId?: Types.ObjectId | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: Types.ObjectId | null | undefined;
        } | {
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
            userId?: string | null | undefined;
            flagReason?: string | null | undefined;
            evidenceId?: string | null | undefined;
            _id: string;
            __v: number;
        })>;
        agreed: boolean;
        selectIncident: "Ballot Stuffing" | "Thuggery & Violence" | "Underage Voting" | "INEC Misconduct" | "Result Alteration" | "Voter Intimidation" | "Late Opening" | "Missing Materials" | "Other Incidents" | "Thuggery and Violence" | "Lack of electoral materials" | "Fraudulent electoral officers" | "Late commencement" | "Over voting" | "Other";
        incidentNote: string;
        incidentPictures: Types.DocumentArray<{
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
        incidentVideos: Types.DocumentArray<{
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
        user?: Types.ObjectId | null | undefined;
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
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const updateMobileNotifications: (userId: Id, updates: MobileNotificationSettings) => Promise<{
    pollingUnitActivity: boolean;
    electionDayAlert: boolean;
    discussionReplies: boolean;
    resultAggregated: boolean;
    reportConfirmed: boolean;
    reportFlagged: boolean;
    securityAlerts: boolean;
    newsletter: boolean;
    newsAndInsights: boolean;
    pressCoverage: boolean;
}>;
export declare const getMobileNotifications: (userId: Id) => Promise<{
    pollingUnitActivity: boolean;
    electionDayAlert: boolean;
    discussionReplies: boolean;
    resultAggregated: boolean;
    reportConfirmed: boolean;
    reportFlagged: boolean;
    securityAlerts: boolean;
    newsletter: boolean;
    newsAndInsights: boolean;
    pressCoverage: boolean;
}>;
export declare const locatePollingUnit: (input: {
    state: string;
    lga: string;
    ward?: string;
    pollingUnit?: string;
}) => Promise<{
    count: number;
    wards: {
        name: string;
        count: number;
        pollingUnits: PollingUnitDetail[];
    }[];
    pollingUnits?: undefined;
} | {
    count: number;
    pollingUnits: PollingUnitDetail[];
    wards?: undefined;
}>;
export declare const submitMobileFeedback: (input: {
    userId: Id;
    email: string;
    title: string;
    message: string;
}) => Promise<import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    user: Types.ObjectId;
    title: string;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    message: string;
    email: string;
    user: Types.ObjectId;
    title: string;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const generateAnonymousUsername: (userId: Id) => Promise<{
    anonymousUsername: string;
}>;
export declare const setAnonymousIdentityToggle: (userId: Id, enabled: boolean) => Promise<{
    useAnonymousIdentity: boolean;
    anonymousUsername: string | null | undefined;
}>;
export {};
//# sourceMappingURL=profileService.d.ts.map