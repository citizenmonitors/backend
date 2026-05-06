import ActiveElection from "../../models/Election/ActiveElection.ts";
import type { AuthenticatedUser } from "../../types/authenticatedRequest.ts";
import { getElectionById } from "../Election/electionService.ts";
import { getOrSetCache } from "../../utils/cache.ts";

type ElectionStatus = "all" | "live" | "upcoming" | "concluded";
type ElectionScope = "all" | "polling-unit";
const MOBILE_ELECTIONS_CACHE_TTL_SECONDS = 30;

const standardizeName = (name: unknown): string =>
  String(name ?? "")
    .toLowerCase()
    .replace(/[-\s]/g, "_")
    .trim();

const normalizeLgaKey = (raw: unknown): string => {
  if (!raw) return "";
  let s = String(raw).toLowerCase().trim();
  s = s.replace(/^\d+[-_\s]+/, "");
  s = s.replace(/[/\s,-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s;
};

const buildElectionCacheKey = (input: {
  status: ElectionStatus;
  scope: ElectionScope;
  user: AuthenticatedUser;
}): string => {
  const userId = String(input.user._id ?? "");
  const role = String(input.user.role ?? "");
  const state = standardizeName((input.user as { state?: unknown }).state);
  const lga = normalizeLgaKey((input.user as { lga?: unknown }).lga);
  return `mobile:elections:${userId}:${role}:${state}:${lga}:${input.status}:${input.scope}`;
};

const electionMatchesPollingScope = (
  electionTypeRaw: unknown,
  electionLocationRaw: unknown,
  user: AuthenticatedUser
): boolean => {
  const electionType = String(electionTypeRaw ?? "").toLowerCase().trim();
  const normalizedLocation = standardizeName(electionLocationRaw ?? "");
  const electionLgaKey = normalizeLgaKey(electionLocationRaw);
  const electionLgaKeys = new Set(
    [normalizedLocation, electionLgaKey, standardizeName(electionLocationRaw ?? "")].filter(
      Boolean
    )
  );

  const userState = standardizeName((user as { state?: unknown }).state);
  const userLgaRaw = (user as { lga?: unknown }).lga;
  const userLgaKeys = new Set(
    [standardizeName(userLgaRaw), normalizeLgaKey(userLgaRaw)].filter(Boolean)
  );

  if (["national", "house-of-representatives", "senatorial"].includes(electionType)) {
    return true;
  }
  if (["gubernatorial", "house-of-assembly"].includes(electionType)) {
    return normalizedLocation === userState;
  }
  if (electionType === "lga") {
    for (const uk of userLgaKeys) {
      for (const ek of electionLgaKeys) {
        if (uk && ek && uk === ek) return true;
      }
    }
    return false;
  }

  return false;
};

const getMobileActiveElectionsUncached = async (input: {
  status: ElectionStatus;
  scope: ElectionScope;
  user: AuthenticatedUser;
}) => {
  const now = new Date();
  const docs = await ActiveElection.find()
    .populate("election", "electionType electionName")
    .sort({ startDate: statusSort(input.status) })
    .lean();

  // For mobile for now, always restrict to user-relevant locations.
  const scopedDocs = docs.filter((doc) => {
    const electionType = (doc as { election?: { electionType?: unknown } }).election
      ?.electionType;
    return electionMatchesPollingScope(
      electionType,
      (doc as { electionLocation?: unknown }).electionLocation,
      input.user
    );
  });

  const withStatus = scopedDocs.map((doc) => {
    const election = (doc as { election?: { electionName?: string; electionType?: string } })
      .election;
    const status = deriveStatus(
      (doc as { startDate?: Date }).startDate,
      (doc as { endDate?: Date }).endDate,
      now
    );
    return {
      id: String((doc as { _id: unknown })._id),
      electionName: election?.electionName,
      electionType: election?.electionType,
      electionLocation: (doc as { electionLocation?: unknown }).electionLocation,
      startDate: (doc as { startDate?: unknown }).startDate,
      endDate: (doc as { endDate?: unknown }).endDate,
      mockElection: (doc as { mockElection?: unknown }).mockElection ?? false,
      partiesCount: Array.isArray((doc as { politicalParties?: unknown }).politicalParties)
        ? ((doc as { politicalParties: unknown[] }).politicalParties.length ?? 0)
        : 0,
      status,
    };
  });

  if (input.status === "all") return withStatus;
  return withStatus.filter((election) => election.status === input.status);
};

export const getMobileActiveElections = async (input: {
  status: ElectionStatus;
  scope: ElectionScope;
  user: AuthenticatedUser;
}) => {
  const cacheKey = buildElectionCacheKey(input);
  return getOrSetCache(cacheKey, MOBILE_ELECTIONS_CACHE_TTL_SECONDS, () =>
    getMobileActiveElectionsUncached(input)
  );
};

// Mobile carousel needs all live elections in scope (not web-prioritized single item).
export const getMobileLiveElectionsCarousel = async (user: AuthenticatedUser) => {
  const elections = await getMobileActiveElections({
    status: "live",
    scope: "polling-unit",
    user,
  });
  return elections.sort(
    (a, b) =>
      new Date(a.startDate as string | number | Date).getTime() -
      new Date(b.startDate as string | number | Date).getTime()
  );
};

export const getMobileElectionSubmissionByActiveElection = async (
  activeElectionId: string,
  userId: string
) => {
  return getElectionById(activeElectionId, userId);
};

const statusSort = (status: ElectionStatus): 1 | -1 => {
  if (status === "concluded") return -1;
  return 1;
};

const deriveStatus = (
  startDate: Date | undefined,
  endDate: Date | undefined,
  now: Date
): ElectionStatus => {
  if (startDate && endDate && startDate <= now && endDate >= now) return "live";
  if (startDate && startDate > now) return "upcoming";
  return "concluded";
};
