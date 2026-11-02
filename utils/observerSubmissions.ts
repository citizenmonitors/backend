import CompletedUser from "../models/CompletedUser.ts";

/**
 * Which observer submissions count toward collation:
 * - uploads by currently approved observers, and
 * - uploads kept after the observer deleted their account (`uploaderDeleted`, `user: null`).
 *
 * Returned under `$and` so callers can still add their own top-level `$or` (location scope).
 */
export const buildCollationSubmitterFilter = async (): Promise<Record<string, unknown>> => {
  const approvedObservers = await CompletedUser.find(
    { role: "observer", isObserverInPollingUnit: true },
    "_id"
  ).lean();
  const approvedObserverIds = approvedObservers.map((u) => u._id);
  return {
    userRole: "observer",
    $and: [
      {
        $or: [{ user: { $in: approvedObserverIds } }, { uploaderDeleted: true }],
      },
    ],
  };
};

type SubmissionRow = {
  uploaderDeleted?: boolean | null;
  pollingUnit?: string | null;
  election?: unknown;
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
};

const idOf = (value: unknown): string => {
  if (value && typeof value === "object" && "_id" in (value as object)) {
    return String((value as { _id?: unknown })._id ?? "");
  }
  return String(value ?? "");
};

const keyOf = (row: SubmissionRow): string =>
  `${idOf(row.election)}|${String(row.pollingUnit ?? "").trim().toLowerCase()}`;

const timeOf = (row: SubmissionRow): number =>
  new Date(row.updatedAt ?? row.createdAt ?? 0).getTime() || 0;

/**
 * A polling unit has one observer slot. When an observer deletes their account their
 * upload is kept anonymised, and a new observer may later upload for the same unit.
 * Count only one submission per election + polling unit:
 * - an active observer's upload wins over any anonymised one;
 * - otherwise keep only the newest anonymised upload.
 */
export const dropSupersededAnonymizedSubmissions = <T extends SubmissionRow>(rows: T[]): T[] => {
  const liveKeys = new Set(rows.filter((r) => !r.uploaderDeleted).map(keyOf));
  const newestAnonymized = new Map<string, T>();
  for (const row of rows) {
    if (!row.uploaderDeleted) continue;
    const key = keyOf(row);
    if (liveKeys.has(key)) continue;
    const current = newestAnonymized.get(key);
    if (!current || timeOf(row) > timeOf(current)) newestAnonymized.set(key, row);
  }
  const keep = new Set<T>(newestAnonymized.values());
  return rows.filter((row) => !row.uploaderDeleted || keep.has(row));
};
