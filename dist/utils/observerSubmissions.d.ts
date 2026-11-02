/**
 * Which observer submissions count toward collation:
 * - uploads by currently approved observers, and
 * - uploads kept after the observer deleted their account (`uploaderDeleted`, `user: null`).
 *
 * Returned under `$and` so callers can still add their own top-level `$or` (location scope).
 */
export declare const buildCollationSubmitterFilter: () => Promise<Record<string, unknown>>;
type SubmissionRow = {
    uploaderDeleted?: boolean | null;
    pollingUnit?: string | null;
    election?: unknown;
    updatedAt?: Date | string | null;
    createdAt?: Date | string | null;
};
/**
 * A polling unit has one observer slot. When an observer deletes their account their
 * upload is kept anonymised, and a new observer may later upload for the same unit.
 * Count only one submission per election + polling unit:
 * - an active observer's upload wins over any anonymised one;
 * - otherwise keep only the newest anonymised upload.
 */
export declare const dropSupersededAnonymizedSubmissions: <T extends SubmissionRow>(rows: T[]) => T[];
export {};
//# sourceMappingURL=observerSubmissions.d.ts.map