import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
export declare const assertMobileCollationAccess: (activeElectionId: string, userId: Id) => Promise<{
    user: import("mongoose").FlattenMaps<{
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
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    };
    active: import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
        election: Types.ObjectId;
        startDate: NativeDate;
        endDate: NativeDate;
        results: Types.ObjectId[];
        incidentReports: Types.ObjectId[];
        resultsCount: number;
        politicalParties: Types.DocumentArray<{
            name?: string | null | undefined;
            code?: string | null | undefined;
            imageUrl?: string | null | undefined;
        }, Types.Subdocument<Types.ObjectId, any, {
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
        _id: Types.ObjectId;
    } & {
        __v: number;
    };
    electionType: string | undefined;
}>;
export declare const getMobileCollationBundle: (activeElectionId: string, userId: Id) => Promise<{
    electionDetails: {
        electionType: string;
        electionName: string | undefined;
        mockElection: boolean;
        electionLocation: string | null | undefined;
        startDate: NativeDate;
        endDate: NativeDate;
    };
    result: {
        aggregateAnalysis: {
            [x: string]: number;
        };
        footer: {
            [x: string]: number;
        };
    }[] | {
        chart: {
            [x: string]: string | number;
            party: string;
        }[];
        regions: {
            [x: string]: string | number | {
                [x: string]: number;
            } | {
                [x: string]: string | number;
                party: string;
            }[];
            regionKey: string;
            chart: {
                [x: string]: string | number;
                party: string;
            }[];
            partiesVotes: {
                [x: string]: number;
            };
            resultsCount: number;
        }[];
        footer: {
            [x: string]: number;
        };
        aggregateAnalysis: {
            [x: string]: number;
        };
        restriction: {
            name: string;
            value: string | null | undefined;
        } | null;
    } | null;
    incidentReport: {
        chart: {
            [x: string]: string | number;
        }[];
        footer: {
            [x: string]: number;
        };
        aggregateAnalysis: Record<string, number>;
        restriction: {
            name: string;
            value: string | null | undefined;
        } | null;
    } | null;
    sentimentAnalysis: {
        chart: {
            voteRating: Record<string, number>;
            voterIntimidation: Record<string, number>;
            voteBuying: Record<string, number>;
        };
        aggregateAnalysis: {
            voteRating: Record<string, number>;
            voterIntimidation: Record<string, number>;
            voteBuying: Record<string, number>;
        };
    } | null;
    geoBreakdown: {
        groupBy: "state" | "lga" | "ward";
        summary: {
            resultsCount: number;
            incidentsCount: number;
            reportedPollingUnits: number;
            totalPollingUnits: number | null;
            scopeLabel: string;
            totalVotes: number;
        };
        regions: Array<Record<string, unknown>>;
    } | {
        groupBy: "state" | "lga" | "ward";
        summary: {
            resultsCount: number;
            incidentsCount: number;
            reportedPollingUnits: number;
            totalPollingUnits: number | null;
            scopeLabel: string;
            totalVotes: number;
        };
        regions: {
            regionName: string;
            resultsCount: number;
            incidentsCount: number;
            reportedPollingUnits: number;
            totalPollingUnits: number | null;
            totalVotes: number;
            percentOfTotalVotes: number;
            parties: {
                party: string;
                votes: number;
                percent: number;
                color: string;
            }[];
        }[];
    };
    overview: {
        lastSyncAt: Date | null;
        resultsUploadedCount: number;
        incidentsReportedCount: number;
        distinctObserverSubmitters: number;
        administrativeFiguresFromReports: {
            accreditedVoters: number;
            rejectedVotes: number;
            spoiledBallotPapers: number;
            usedBallotPapers: number;
        };
        officialInecAggregate: {
            status: "not_recorded";
            value: number | null;
        };
    };
    meta: {
        activeElectionId: string;
        electionType: string | undefined;
        electionName: string | undefined;
        electionLocation: string | null | undefined;
        mockElection: boolean;
        startDate: NativeDate;
        endDate: NativeDate;
    };
}>;
export {};
//# sourceMappingURL=collationBundleService.d.ts.map