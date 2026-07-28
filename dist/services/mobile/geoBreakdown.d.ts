type GroupByField = "state" | "lga" | "ward";
type PartyVote = {
    party: string;
    count: number;
};
type ResultRow = {
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
export declare const resolveGeoGroupBy: (electionType: string | undefined) => {
    groupBy: GroupByField;
    scopeLabel: string;
};
/**
 * Mobile Collation “Geo Breakdown” cards — grouped by election-type location filter.
 * national → state; gubernatorial/HoA/senatorial/HoR → LGA; lga → ward.
 */
export declare const buildMobileGeoBreakdown: (input: {
    electionType: string | undefined;
    user: Viewer;
    results: ResultRow[];
    incidents: IncidentRow[];
}) => {
    groupBy: GroupByField;
    summary: {
        resultsCount: number;
        incidentsCount: number;
        reportedPollingUnits: number;
        totalPollingUnits: number | null;
        scopeLabel: string;
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