import mongoose from "mongoose";
declare const _default: mongoose.Model<{
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
    observerId: mongoose.Types.DocumentArray<{
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
    adminPermissions?: mongoose.Types.ObjectId | null | undefined;
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
}, {}, {}, {}, mongoose.Document<unknown, {}, {
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
    observerId: mongoose.Types.DocumentArray<{
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
    adminPermissions?: mongoose.Types.ObjectId | null | undefined;
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
    observerId: mongoose.Types.DocumentArray<{
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
    adminPermissions?: mongoose.Types.ObjectId | null | undefined;
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
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
    observerId: mongoose.Types.DocumentArray<{
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
    adminPermissions?: mongoose.Types.ObjectId | null | undefined;
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
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
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
    observerId: mongoose.Types.DocumentArray<{
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
    adminPermissions?: mongoose.Types.ObjectId | null | undefined;
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
}>> & mongoose.FlatRecord<{
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
    observerId: mongoose.Types.DocumentArray<{
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
    adminPermissions?: mongoose.Types.ObjectId | null | undefined;
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=CompletedUser.d.ts.map