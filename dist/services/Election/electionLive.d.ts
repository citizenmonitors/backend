import type { Types } from "mongoose";
type ElectionRef = {
    electionType: string;
    electionName?: string;
};
type Viewer = {
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
};
type Id = Types.ObjectId | string;
type GroupByField = "state" | "lga" | "ward";
type ActiveElectionLeanDoc = {
    _id: Types.ObjectId;
    election: ElectionRef;
    mockElection?: boolean;
    electionLocation?: unknown;
    startDate?: Date;
    endDate?: Date;
};
export declare const getAllOngoingElectionResults: (userId: string) => Promise<{
    message: string;
    electionDetails?: undefined;
    result?: undefined;
} | {
    electionDetails: {
        electionType: string;
        electionName: string | undefined;
        mockElection: boolean | undefined;
        electionLocation: unknown;
        startDate: Date | undefined;
        endDate: Date | undefined;
    };
    result: Record<string, unknown>[] | {
        message: string;
        chart?: undefined;
        aggregateAnalysis?: undefined;
        footer?: undefined;
        restriction?: undefined;
    } | {
        chart: {
            [x: string]: string | number;
            party: string;
        }[];
        aggregateAnalysis: Record<string, number>;
        footer: {
            [x: string]: number;
        };
        restriction: {
            name: string;
            value: string | null | undefined;
        } | null;
        message?: undefined;
    };
    message?: undefined;
}>;
export declare const getLiveElectionService: (electionId: Id, userId: Id, options?: {
    includeVolunteerSubmissions?: boolean;
}) => Promise<{
    electionDetails: {
        electionType: string;
        electionName: string | undefined;
        mockElection: boolean;
        electionLocation: string | null | undefined;
        startDate: NativeDate;
        endDate: NativeDate;
    };
    result: {
        aggregateAnalysis: Record<string, number>;
        footer: {
            [x: string]: number;
        };
    }[] | {
        chart: {
            [x: string]: string | number;
            party: string;
        }[] | {
            state: string;
            chart: {
                [x: string]: string | number;
                party: string;
            }[];
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
}>;
/** Mongo filter for observer result/incident rows visible in collation for this user. */
export declare const buildObserverSubmissionLocationFilter: (electionType: string | undefined, user: {
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
}) => Record<string, unknown>;
export declare const observerSubmissionDocMatchesLocationFilter: (doc: {
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
}, electionType: string | undefined, user: {
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
}) => boolean;
export declare const getSentimentAnalysisService: (electionId: Id, groupBy: GroupByField | undefined, user: Viewer, activeElection: ActiveElectionLeanDoc) => Promise<{
    chart: {
        voteRating: Record<string, number>;
        voterIntimidation: Record<string, number>;
        voteBuying: Record<string, number>;
    };
}>;
export declare const getActivityBoardAndNotificationsService: () => Promise<{
    activityBoard: {
        "all the total result submitted": number;
        "all the total result submitted by observer": any;
        "all the total result submitted by volunteer": any;
        "all the total approved result": any;
    };
    notifications: (import("mongoose").FlattenMaps<{
        createdAt: NativeDate;
        targetUsers: Types.ObjectId[];
        readBy: Types.ObjectId[];
        deletedBy: Types.ObjectId[];
        type?: "newsletter" | "election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert" | "pending-approval" | "discussion-reply" | "news-insight" | "press-coverage" | null | undefined;
        info?: string | null | undefined;
        activeElectionId?: Types.ObjectId | null | undefined;
        preferenceKey?: "newsletter" | "pollingUnitActivity" | "electionDayAlert" | "discussionReplies" | "resultAggregated" | "reportConfirmed" | "reportFlagged" | "securityAlerts" | "newsAndInsights" | "pressCoverage" | null | undefined;
        body?: string | null | undefined;
        articleSlug?: string | null | undefined;
        articleId?: string | null | undefined;
        recipients?: string[] | null | undefined;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
}>;
export {};
//# sourceMappingURL=electionLive.d.ts.map