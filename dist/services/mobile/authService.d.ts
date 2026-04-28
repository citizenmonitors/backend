type MobileMetaInput = {
    platform?: string;
    deviceId?: string;
    appVersion?: string;
    pushToken?: string;
};
type MulterLikeFile = {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
};
export declare const mobileRegister: (payload: {
    email: string;
    password: string;
    confirmPassword: string;
}, mobileMeta?: MobileMetaInput) => Promise<void>;
export declare const mobileVerifyEmail: (email: string, verificationCode: string) => Promise<{
    message: string;
}>;
export declare const mobileResendToken: (email: string) => Promise<{
    message: string;
}>;
export declare const mobileContinueWithGoogle: (idToken: string, mobileMeta?: MobileMetaInput) => Promise<{
    token: string;
    user: {
        email: string;
        isVerified: boolean;
        hasSubmittedRoleForm: boolean;
        hasSetPassword: boolean;
        role?: "observer" | "volunteer" | "public-viewer" | null | undefined;
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
        isObserverInPollingUnit?: boolean | null | undefined;
        pendingObserverVerification?: boolean | null | undefined;
        governmentId?: string | null | undefined;
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
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    };
    requiresPasswordSetup: boolean;
    nextStep: string;
}>;
export declare const mobileSetPassword: (bearerToken: string, password: string) => Promise<{
    message: string;
    nextStep: string;
}>;
export declare const mobileSubmitDetails: (input: {
    email: string;
    details: Record<string, unknown>;
    file?: MulterLikeFile;
}) => Promise<{
    user: {
        profileImage: unknown;
        email: string;
        isVerified: boolean;
        hasSubmittedRoleForm: boolean;
        hasSetPassword: boolean;
        role?: "observer" | "volunteer" | "public-viewer" | null | undefined;
        pendingEmail?: string | null | undefined;
        firstName?: string | null | undefined;
        lastName?: string | null | undefined;
        gender?: string | null | undefined;
        dateOfBirth?: string | null | undefined;
        nationality?: string | null | undefined;
        state?: string | null | undefined;
        lga?: string | null | undefined;
        ward?: string | null | undefined;
        pollingUnit?: string | null | undefined;
        isRegisteredVoter?: boolean | null | undefined;
        isPoliticalPartyMember?: boolean | null | undefined;
        isElectionWitnessReady?: boolean | null | undefined;
        isOpenToSurvey?: boolean | null | undefined;
        whyYouJoinUs?: string | null | undefined;
        isObserverInPollingUnit?: boolean | null | undefined;
        pendingObserverVerification?: boolean | null | undefined;
        governmentId?: string | null | undefined;
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
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    };
    isObserverInPollingUnit: boolean;
}>;
export declare const mobileSelectRole: (email: string, role: string) => Promise<{
    message: string;
    token: string;
    user: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        email: string;
        isObserverInPollingUnit: boolean;
        pendingObserverVerification: boolean;
        hasSubmittedRoleForm: boolean;
        hasSetPassword: boolean;
        useAnonymousIdentity: boolean;
        coverageUpdateCount: number;
        observerId: import("mongoose").Types.DocumentArray<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }, import("mongoose").Types.Subdocument<import("mongoose").Types.ObjectId, any, {
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
        adminPermissions?: import("mongoose").Types.ObjectId | null | undefined;
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
            } | null | undefined;
        } | null | undefined;
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    };
} | {
    message: string;
    token?: undefined;
    user?: undefined;
} | {
    message: string;
    token: string;
    user: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        email: string;
        isObserverInPollingUnit: boolean;
        pendingObserverVerification: boolean;
        hasSubmittedRoleForm: boolean;
        hasSetPassword: boolean;
        useAnonymousIdentity: boolean;
        coverageUpdateCount: number;
        observerId: import("mongoose").Types.DocumentArray<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }, import("mongoose").Types.Subdocument<import("mongoose").Types.ObjectId, any, {
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
        adminPermissions?: import("mongoose").Types.ObjectId | null | undefined;
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
            } | null | undefined;
        } | null | undefined;
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    };
    nextStep: string;
}>;
export declare const mobileSubmitObserverDetails: (input: {
    email: string;
    observerIdFiles: MulterLikeFile[];
    phoneNumber: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
}) => Promise<{
    message: string;
    token: string;
    user: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        email: string;
        isObserverInPollingUnit: boolean;
        pendingObserverVerification: boolean;
        hasSubmittedRoleForm: boolean;
        hasSetPassword: boolean;
        useAnonymousIdentity: boolean;
        coverageUpdateCount: number;
        observerId: import("mongoose").Types.DocumentArray<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }, import("mongoose").Types.Subdocument<import("mongoose").Types.ObjectId, any, {
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
        adminPermissions?: import("mongoose").Types.ObjectId | null | undefined;
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
            } | null | undefined;
        } | null | undefined;
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    };
}>;
export declare const mobileSignIn: (payload: {
    email: string;
    password: string;
}, mobileMeta?: MobileMetaInput) => Promise<{
    token: string;
    user: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        email: string;
        isObserverInPollingUnit: boolean;
        pendingObserverVerification: boolean;
        hasSubmittedRoleForm: boolean;
        hasSetPassword: boolean;
        useAnonymousIdentity: boolean;
        coverageUpdateCount: number;
        observerId: import("mongoose").Types.DocumentArray<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }, import("mongoose").Types.Subdocument<import("mongoose").Types.ObjectId, any, {
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
        adminPermissions?: import("mongoose").Types.ObjectId | null | undefined;
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
            } | null | undefined;
        } | null | undefined;
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    };
}>;
export declare const mobileForgotPassword: (email: string) => Promise<{
    message: string;
}>;
export declare const mobileResendForgotPasswordOtp: (email: string) => Promise<{
    message: string;
}>;
export declare const mobileResetPassword: (email: string, otp: string, password: string) => Promise<{
    message: string;
}>;
export declare const mobileValidateSession: (token: string) => Promise<{
    user: {
        createdAt: NativeDate;
        updatedAt: NativeDate;
        email: string;
        isObserverInPollingUnit: boolean;
        pendingObserverVerification: boolean;
        hasSubmittedRoleForm: boolean;
        hasSetPassword: boolean;
        useAnonymousIdentity: boolean;
        coverageUpdateCount: number;
        observerId: import("mongoose").Types.DocumentArray<{
            name?: string | null | undefined;
            type?: string | null | undefined;
            url?: string | null | undefined;
            location?: string | null | undefined;
            size?: number | null | undefined;
        }, import("mongoose").Types.Subdocument<import("mongoose").Types.ObjectId, any, {
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
        adminPermissions?: import("mongoose").Types.ObjectId | null | undefined;
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
            } | null | undefined;
        } | null | undefined;
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    };
}>;
export {};
//# sourceMappingURL=authService.d.ts.map