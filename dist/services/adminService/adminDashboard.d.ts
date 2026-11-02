import type { Types } from "mongoose";
type Id = string | Types.ObjectId;
export declare const getDashboardData: () => Promise<{
    registeredUsers: {
        count: number;
        lastMonthComparison: string;
        data: (number | undefined)[];
    };
    observers: {
        count: number;
        lastMonthComparison: string;
        data: (number | undefined)[];
    };
    activeUsers: {
        count: number;
        lastMonthComparison: string;
        data: number[];
    };
    resultsUploaded: {
        count: number;
        lastMonthComparison: string;
        data: (number | undefined)[];
    };
    userInfo: {
        gender: any[];
        roles: any[];
    };
    admins: (import("mongoose").Document<unknown, {}, {
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
    })[];
    dailyTraffic: {
        count: number;
        lastMonthComparison: string;
        data: number[];
    };
}>;
export declare const getAllUsersService: () => Promise<{
    registeredUsers: {
        count: number;
        lastMonthComparison: string;
        data: (number | undefined)[];
    };
    observers: {
        count: number;
        lastMonthComparison: string;
        data: (number | undefined)[];
    };
    volunteers: {
        count: number;
        lastMonthComparison: string;
        data: (number | undefined)[];
    };
    awaitingVerification: {
        count: number;
        lastMonthComparison: string;
        data: (number | undefined)[];
    };
    userInfo: {
        gender: any[];
        roles: any[];
    };
    users: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
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
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const getUserByIdService: (id: Id) => Promise<import("mongoose").FlattenMaps<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
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
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class AdminDeleteForbiddenError extends Error {
    constructor(message: string);
}
/**
 * Admin removes an account. Same data rules as self-service deletion
 * (observer submissions kept anonymised for collation; personal content removed).
 * Guards: no deleting yourself here; only a super-admin can delete admin accounts.
 * To remove a specific result or incident, use the flagged-result delete tooling.
 */
export declare const deleteUserService: (userId: Id, adminId: Id) => Promise<{
    message: string;
    deletedResults: number;
    deletedIncidents: number;
    anonymizedResults: number;
    anonymizedIncidents: number;
}>;
export declare const approveObserverService: (id: Id, adminId: Id) => Promise<{
    message: string;
    observers: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
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
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const getAllObsersverService: () => Promise<{
    message: string;
    observers: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
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
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const unapproveObserverService: (id: Id, adminId: Id) => Promise<{
    message: string;
    observers: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
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
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const downgradeObserverService: (id: Id, adminReason: string, adminId: Id) => Promise<{
    message: string;
    observers: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
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
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export declare const getAllActiveElectionsService: () => Promise<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
    startDate: NativeDate;
    endDate: NativeDate;
    mockElection: boolean;
    electionLocation?: string | null | undefined;
    _id: Types.ObjectId;
    __v: number;
    electionType: string | undefined;
    electionName: string | undefined;
}[]>;
export declare const getAllElectionTypesService: () => Promise<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
    mockElection: boolean;
    _id: Types.ObjectId;
    __v: number;
    electionType: string | undefined;
    electionName: string | undefined;
}[]>;
export declare const getAdminLiveElectionService: (electionId: Id) => Promise<{
    electionDetails: {
        electionId: Id;
        electionName: string | undefined;
        electionType: string | undefined;
        startDate: NativeDate;
        endDate: NativeDate;
        electionLocation: string | null | undefined;
        mockElection: boolean;
    };
    result: null;
} | {
    electionDetails: {
        electionId: Id;
        electionName: string | undefined;
        electionType: string;
        startDate: NativeDate;
        endDate: NativeDate;
        electionLocation: string | null | undefined;
        mockElection: boolean;
    };
    result: {
        state: string;
        chart: {
            [x: string]: string | number;
            party: string;
        }[];
        aggregateAnalysis: Record<string, number>;
        footer: {
            [x: string]: number;
        };
    }[];
} | {
    electionDetails: {
        electionId: Id;
        electionName: string | undefined;
        electionType: string;
        startDate: NativeDate;
        endDate: NativeDate;
        electionLocation: string | null | undefined;
        mockElection: boolean;
    };
    result: {
        aggregateAnalysis: Record<string, number>;
        footer: {
            [x: string]: number;
        };
        chart?: undefined;
    };
} | {
    electionDetails: {
        electionId: Id;
        electionName: string | undefined;
        electionType: string | undefined;
        startDate: NativeDate;
        endDate: NativeDate;
        electionLocation: string | null | undefined;
        mockElection: boolean;
    };
    result: {
        chart: {
            [x: string]: string | number;
            party: string;
        }[];
        aggregateAnalysis: Record<string, number>;
        footer: {
            [x: string]: number;
        };
    };
} | {
    electionDetails: {
        electionId: Id;
        electionName: string | undefined;
        electionType: string | undefined;
        startDate: NativeDate;
        endDate: NativeDate;
        electionLocation: string | null | undefined;
        mockElection: boolean;
    };
    result: {
        lga: string;
        chart: {
            [x: string]: string | number;
            party: string;
        }[];
        aggregateAnalysis: Record<string, number>;
        footer: {
            [x: string]: number;
        };
    }[];
}>;
type AdminDashboardRole = "admin" | "super-admin";
type CreateAdminBody = {
    email: string;
    role: AdminDashboardRole;
    permissions?: Record<string, boolean>;
};
export declare const createAdminService: (adminId: Id | undefined, { email, role, permissions }: CreateAdminBody) => Promise<{
    message: string;
    user: import("mongoose").Document<unknown, {}, {
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
    };
}>;
type UpdateAdminPermissionsBody = {
    role?: AdminDashboardRole;
    permissions?: Record<string, boolean>;
};
export declare const updateAdminPermissionsService: (adminId: Id, updatedBy: Id, { role, permissions }: UpdateAdminPermissionsBody) => Promise<{
    message: string;
    updatedPermissions: import("mongoose").Document<unknown, {}, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        user: Types.ObjectId;
        createElection: boolean;
        updateElection: boolean;
        createActiveElection: boolean;
        updateActiveElection: boolean;
        deleteElection: boolean;
        deleteActiveElection: boolean;
        getAdmins: boolean;
        viewResults: boolean;
        viewResult: boolean;
        deleteResult: boolean;
        viewUsers: boolean;
        viewUser: boolean;
        deleteUser: boolean;
        approveObserver: boolean;
        unapproveObserver: boolean;
        downgradeObserver: boolean;
        deleteFlagged: boolean;
        restoreFlagged: boolean;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        user: Types.ObjectId;
        createElection: boolean;
        updateElection: boolean;
        createActiveElection: boolean;
        updateActiveElection: boolean;
        deleteElection: boolean;
        deleteActiveElection: boolean;
        getAdmins: boolean;
        viewResults: boolean;
        viewResult: boolean;
        deleteResult: boolean;
        viewUsers: boolean;
        viewUser: boolean;
        deleteUser: boolean;
        approveObserver: boolean;
        unapproveObserver: boolean;
        downgradeObserver: boolean;
        deleteFlagged: boolean;
        restoreFlagged: boolean;
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    };
}>;
export declare const suspendAdminService: (adminId: Id, suspendedBy: Id) => Promise<{
    message: string;
    updatedAdmin: import("mongoose").Document<unknown, {}, {
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
    };
}>;
export declare const getAllAdminsService: () => Promise<{
    admins: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
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
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
    totalLogs: number;
    logs: number[];
    statsPercentage: string;
}>;
export declare const getAccessControlService: () => Promise<{
    admin: {
        action: string;
        timeCreated: NativeDate;
        _id: Types.ObjectId;
    };
}[]>;
export declare const getAdminLogsService: (adminId: Id) => Promise<{
    admin: {
        action: string;
        timeCreated: NativeDate;
        _id: Types.ObjectId;
    };
}[]>;
export declare const getSingleAdminService: (adminId: Id, { role, permissions }: UpdateAdminPermissionsBody) => Promise<{
    _id: Types.ObjectId;
    firstName: string | null | undefined;
    lastName: string | null | undefined;
    email: string;
    role: "observer" | "volunteer" | "public-viewer" | "admin" | "super-admin" | null | undefined;
    permissions: Types.ObjectId | Record<string, boolean>;
}>;
export declare const logAdminAction: (adminId: Id, action: string) => Promise<void>;
export declare const processAdminLogs: () => Promise<{
    totalLogs: number;
    logs: number[];
    statsPercentage: string;
}>;
export declare const downgradeAllObserverService: (adminReason: string) => Promise<{
    message: string;
}>;
export declare const getUserEmailsService: () => Promise<string[]>;
export {};
//# sourceMappingURL=adminDashboard.d.ts.map