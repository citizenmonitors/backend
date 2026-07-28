import type { Types } from "mongoose";
type Id = Types.ObjectId | string;
export declare const ELECTION_UPDATE_NOTIFICATION_TYPES: readonly ["election-day-alert", "result-aggregated", "result-upload", "incident-upload", "report-confirmed", "report-flagged", "security-alert"];
export type ElectionUpdateNotificationType = (typeof ELECTION_UPDATE_NOTIFICATION_TYPES)[number];
export declare const isActiveElectionConcluded: (endDate: Date | string | null | undefined) => boolean;
export declare const isActiveElectionConcludedById: (activeElectionId: Id | null | undefined) => Promise<boolean>;
/** Hide election-update notifications once their active election has ended. */
export declare const buildHideConcludedElectionNotificationsFilter: () => Promise<{
    $or: ({
        type: {
            $nin: ("election-day-alert" | "result-aggregated" | "result-upload" | "incident-upload" | "report-confirmed" | "report-flagged" | "security-alert")[];
        };
        activeElectionId?: undefined;
    } | {
        activeElectionId: {
            $exists: boolean;
            $nin?: undefined;
        };
        type?: undefined;
    } | {
        activeElectionId: null;
        type?: undefined;
    } | {
        activeElectionId: {
            $nin: Types.ObjectId[];
            $exists?: undefined;
        };
        type?: undefined;
    })[];
}>;
export {};
//# sourceMappingURL=electionNotificationVisibility.d.ts.map