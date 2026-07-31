type GroupByField = "state" | "lga" | "ward";
type PartyVote = {
    party: string;
    count?: number;
    votes?: number;
};
type ResultRow = {
    userRole?: string | null;
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
    pollingUnit?: string | null;
    partiesVotes?: PartyVote[];
};
type IncidentRow = {
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
    pollingUnit?: string | null;
};
type Viewer = {
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
};
type ChartRow = Record<string, unknown> & {
    party?: string;
};
export declare const resolveGeoGroupBy: (electionType: string | undefined) => {
    groupBy: GroupByField;
    scopeLabel: string;
};
/** Live chart rows look like `{ party: "APC", APC: 1200 }`. */
export declare const chartRowsToVotesMap: (chart: ChartRow[] | undefined) => Record<string, number>;
/**
 * Prefer live `result` (same object that powers the chart). Falls back to
 * re-aggregating raw observer rows only if live result has no usable regions.
 */
export declare const buildMobileGeoBreakdown: (input: {
    electionType: string | undefined;
    user: Viewer;
    /** Live collation `result` — chart + regions from getLiveElectionService. */
    liveResult?: unknown;
    results?: ResultRow[];
    incidents?: IncidentRow[];
}) => {
    groupBy: GroupByField;
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
    groupBy: GroupByField;
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
export {};
//# sourceMappingURL=geoBreakdown.d.ts.map