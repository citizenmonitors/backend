import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
type MulterLikeFile = {
    mimetype: string;
    originalname: string;
    size: number;
    buffer: Buffer;
};
type ObserverIdFiles = {
    "observerId[]": MulterLikeFile[];
};
type VolunteerToObserverPayload = {
    email: string;
    details: Record<string, unknown>;
    files: Partial<ObserverIdFiles>;
};
type UpdateUserNotificationsInput = {
    inbox?: unknown;
    election?: unknown;
    newsletter?: unknown;
};
type UpdateUserPayload = Record<string, unknown> & {
    password?: string;
    confirmPassword?: string;
    notifications?: UpdateUserNotificationsInput;
};
type UpdateUserFilePayload = {
    profileImage?: MulterLikeFile;
};
export declare const volunteerToObserverService: ({ email, details, files, }: VolunteerToObserverPayload) => Promise<{
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
        } | null | undefined;
    } | null | undefined;
    _id: Types.ObjectId;
    __v: number;
}>;
export declare const updateUserService: (userId: Id, updateData: UpdateUserPayload, currentPassword: string, file?: UpdateUserFilePayload | null) => Promise<Record<string, unknown>>;
export declare const updateUserEmail: (userId: Id, newEmail: string) => Promise<{
    message: string;
}>;
export declare const verifyUserEmail: (userId: Id, verificationCode: string) => Promise<{
    message: string;
}>;
export declare const resendTokenService: (userId: Id) => Promise<{
    message: string;
}>;
export declare const deleteUserService: (userId: Id) => Promise<import("mongoose").Document<unknown, {}, {
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
        } | null | undefined;
    } | null | undefined;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
//# sourceMappingURL=userService.d.ts.map