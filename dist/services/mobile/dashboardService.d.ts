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
        type: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | null | undefined;
        title: string;
        info: string;
        timeAgo: string;
        createdAt: NativeDate;
    }[];
    collationUpdates: {
        id: string;
        type: "newsletter" | "result-upload" | "incident-upload" | "pending-approval" | "security-alert" | "discussion-reply" | "result-aggregated" | "report-confirmed" | "report-flagged" | "election-day-alert" | null | undefined;
        title: string;
        info: string;
        timeAgo: string;
        createdAt: NativeDate;
    }[];
    pulseAndDiscourse: {
        id: string;
        activeElectionId: string;
        body: string;
        imageUrl: string | undefined;
        likesCount: number;
        commentsCount: number;
        authorName: string;
        timeAgo: string;
        createdAt: NativeDate;
    }[];
    latestNewsAndInsights: {
        id: string;
        title: string;
        content: string;
        publishedAt: NativeDate;
    }[];
}>;
//# sourceMappingURL=dashboardService.d.ts.map