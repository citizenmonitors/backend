import type { AuthenticatedUser } from "../../types/authenticatedRequest.ts";
export declare const getMobileDashboard: (user: AuthenticatedUser) => Promise<{
    liveElections: {
        id: string;
        electionName: string | undefined;
        electionType: string | undefined;
        electionLocation: unknown;
        startDate: unknown;
        endDate: unknown;
        mockElection: {};
        partiesCount: number;
        status: "all" | "live" | "upcoming" | "concluded";
    }[];
    electionUpdates: {
        id: string;
        type: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | "news-insight" | "press-coverage" | null | undefined;
        title: string;
        info: string;
        timeAgo: string;
        createdAt: NativeDate;
    }[];
    collationUpdates: {
        id: string;
        source: string;
        activeElectionId: string;
        body: string;
        imageUrl: string | undefined;
        likesCount: number;
        commentsCount: number;
        authorName: string;
        timeAgo: string;
        createdAt: NativeDate;
    }[];
    pulseAndDiscourse: {
        id: string;
        source: string;
        body: string;
        imageUrl: string | null | undefined;
        likesCount: number;
        commentsCount: number;
        authorName: string;
        timeAgo: string;
        createdAt: NativeDate;
    }[];
    reportThreadUpdates: {
        id: string;
        targetType: "election_result" | "incident_report";
        targetId: string;
        activeElectionId: string;
        body: string;
        likesCount: number;
        authorName: string;
        timeAgo: string;
        createdAt: NativeDate;
    }[];
    latestNewsAndInsights: {
        id: string;
        slug: string;
        title: string;
        thumbnailUrl: string;
        summary: string;
        publishedAt: NativeDate;
        likesCount: number;
        commentsCount: number;
        isLikedByCurrentUser: boolean;
    }[];
    pressCoverage: {
        id: string;
        slug: string;
        title: string;
        thumbnail: string;
        summary: string;
        publishedAt: NativeDate;
        dateline: string | undefined;
        likesCount: number;
        commentsCount: number;
        isLikedByCurrentUser: boolean;
    }[];
}>;
//# sourceMappingURL=dashboardService.d.ts.map