/**
 * Same relevance rules as `getAllActiveElectionsService` (non-admin users):
 * which active-election rows a user should see for their registered location.
 */
export declare const standardizeElectionName: (name: unknown) => string;
export declare const normalizeLgaKeyForElection: (raw: unknown) => string;
type ElectionLite = {
    electionType?: string;
    electionName?: string;
};
export declare const isActiveElectionRelevantForUser: (election: ElectionLite | null | undefined, electionLocation: unknown, user: {
    state?: unknown;
    lga?: unknown;
}) => boolean;
export {};
//# sourceMappingURL=electionRelevanceForUser.d.ts.map