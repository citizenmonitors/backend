import ActiveElection from "../../models/Election/ActiveElection.js";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import { getElectionById, getResultsAndPerformAction, } from "../Election/electionService.js";
import { getOrSetCache } from "../../utils/cache.js";
import { isActiveElectionRelevantForUser } from "../../utils/electionRelevanceForUser.js";
const filterFeedToActiveElection = (feed, activeElectionId) => ({
    results: feed.results.filter((r) => String(r.electionTypeId) === String(activeElectionId)),
    incidentReports: feed.incidentReports.filter((r) => String(r.electionTypeId) === String(activeElectionId)),
});
/**
 * Mobile agree/flag — same polling-unit rules as web `POST /user-action`,
 * but scoped to one ActiveElection (user opens that election first).
 */
export const mobileElectionUserAction = async (activeElectionId, userId, body, flagMediaFiles) => {
    const user = await CompletedUser.findById(userId).lean();
    if (!user || !user.pollingUnit) {
        throw new Error("User not found or polling unit is missing");
    }
    const active = await ActiveElection.findById(activeElectionId)
        .populate("election", "electionType electionName")
        .lean();
    if (!active) {
        throw new Error("Election not found");
    }
    const electionRef = active.election;
    if (!isActiveElectionRelevantForUser(electionRef ?? undefined, active.electionLocation, user)) {
        throw new Error("This election is not available for your location");
    }
    if (!body?.action) {
        const feed = (await getResultsAndPerformAction(userId, null));
        return filterFeedToActiveElection(feed, activeElectionId);
    }
    if (body.dataType === "election") {
        const doc = await ElectionData.findById(body.electionId).lean();
        if (!doc || String(doc.election) !== String(activeElectionId)) {
            throw new Error("Result not found for this election");
        }
    }
    else if (body.dataType === "incident") {
        const doc = await IncidentReport.findById(body.electionId).lean();
        if (!doc || String(doc.election) !== String(activeElectionId)) {
            throw new Error("Incident report not found for this election");
        }
    }
    else {
        throw new Error("Invalid data type");
    }
    // Same PU check as web (default requireSamePollingUnit: true).
    const feed = (await getResultsAndPerformAction(userId, {
        electionId: body.electionId,
        action: body.action,
        dataType: body.dataType,
        flagReason: body.flagReason,
    }, flagMediaFiles));
    return filterFeedToActiveElection(feed, activeElectionId);
};
const MOBILE_ELECTIONS_CACHE_TTL_SECONDS = 30;
const standardizeName = (name) => String(name ?? "")
    .toLowerCase()
    .replace(/[-\s]/g, "_")
    .trim();
const normalizeLgaKey = (raw) => {
    if (!raw)
        return "";
    let s = String(raw).toLowerCase().trim();
    s = s.replace(/^\d+[-_\s]+/, "");
    s = s.replace(/[/\s,-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    return s;
};
const buildElectionCacheKey = (input) => {
    const userId = String(input.user._id ?? "");
    const role = String(input.user.role ?? "");
    const state = standardizeName(input.user.state);
    const lga = normalizeLgaKey(input.user.lga);
    return `mobile:elections:${userId}:${role}:${state}:${lga}:${input.status}:${input.scope}`;
};
const electionMatchesPollingScope = (electionTypeRaw, electionLocationRaw, user) => {
    const electionType = String(electionTypeRaw ?? "").toLowerCase().trim();
    const normalizedLocation = standardizeName(electionLocationRaw ?? "");
    const electionLgaKey = normalizeLgaKey(electionLocationRaw);
    const electionLgaKeys = new Set([normalizedLocation, electionLgaKey, standardizeName(electionLocationRaw ?? "")].filter(Boolean));
    const userState = standardizeName(user.state);
    const userLgaRaw = user.lga;
    const userLgaKeys = new Set([standardizeName(userLgaRaw), normalizeLgaKey(userLgaRaw)].filter(Boolean));
    if (["national", "house-of-representatives", "senatorial"].includes(electionType)) {
        return true;
    }
    if (["gubernatorial", "house-of-assembly"].includes(electionType)) {
        return normalizedLocation === userState;
    }
    if (electionType === "lga") {
        for (const uk of userLgaKeys) {
            for (const ek of electionLgaKeys) {
                if (uk && ek && uk === ek)
                    return true;
            }
        }
        return false;
    }
    return false;
};
const getMobileActiveElectionsUncached = async (input) => {
    const now = new Date();
    const docs = await ActiveElection.find()
        .populate("election", "electionType electionName")
        .sort({ startDate: statusSort(input.status) })
        .lean();
    // For mobile for now, always restrict to user-relevant locations.
    const scopedDocs = docs.filter((doc) => {
        const electionType = doc.election
            ?.electionType;
        return electionMatchesPollingScope(electionType, doc.electionLocation, input.user);
    });
    const withStatus = scopedDocs.map((doc) => {
        const election = doc
            .election;
        const status = deriveStatus(doc.startDate, doc.endDate, now);
        return {
            id: String(doc._id),
            electionName: election?.electionName,
            electionType: election?.electionType,
            electionLocation: doc.electionLocation,
            startDate: doc.startDate,
            endDate: doc.endDate,
            mockElection: doc.mockElection ?? false,
            partiesCount: Array.isArray(doc.politicalParties)
                ? (doc.politicalParties.length ?? 0)
                : 0,
            status,
        };
    });
    if (input.status === "all")
        return withStatus;
    return withStatus.filter((election) => election.status === input.status);
};
export const getMobileActiveElections = async (input) => {
    const cacheKey = buildElectionCacheKey(input);
    return getOrSetCache(cacheKey, MOBILE_ELECTIONS_CACHE_TTL_SECONDS, () => getMobileActiveElectionsUncached(input));
};
// Mobile carousel needs all live elections in scope (not web-prioritized single item).
export const getMobileLiveElectionsCarousel = async (user) => {
    const elections = await getMobileActiveElections({
        status: "live",
        scope: "polling-unit",
        user,
    });
    return elections.sort((a, b) => new Date(a.startDate).getTime() -
        new Date(b.startDate).getTime());
};
export const getMobileElectionSubmissionByActiveElection = async (activeElectionId, userId) => {
    return getElectionById(activeElectionId, userId);
};
const statusSort = (status) => {
    if (status === "concluded")
        return -1;
    return 1;
};
const deriveStatus = (startDate, endDate, now) => {
    if (startDate && endDate && startDate <= now && endDate >= now)
        return "live";
    if (startDate && startDate > now)
        return "upcoming";
    return "concluded";
};
//# sourceMappingURL=electionService.js.map