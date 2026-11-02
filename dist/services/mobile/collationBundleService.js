import ActiveElection from "../../models/Election/ActiveElection.js";
import ElectionData from "../../models/Election/ElectionData.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import CompletedUser from "../../models/CompletedUser.js";
import { getLiveElectionService, buildObserverSubmissionLocationFilter, } from "../Election/electionLive.js";
import { isActiveElectionRelevantForUser } from "../../utils/electionRelevanceForUser.js";
import { buildMobileGeoBreakdown } from "./geoBreakdown.js";
import { buildCollationSubmitterFilter, dropSupersededAnonymizedSubmissions, } from "../../utils/observerSubmissions.js";
export const assertMobileCollationAccess = async (activeElectionId, userId) => {
    const user = await CompletedUser.findById(userId).lean();
    if (!user)
        throw new Error("User not found");
    const active = await ActiveElection.findById(activeElectionId)
        .populate("election", "electionType electionName")
        .lean();
    if (!active)
        throw new Error("Election not found");
    const electionRef = active.election;
    if (!isActiveElectionRelevantForUser(electionRef ?? undefined, active.electionLocation, user)) {
        throw new Error("This election is not available for your location");
    }
    return { user, active, electionType: electionRef?.electionType };
};
export const getMobileCollationBundle = async (activeElectionId, userId) => {
    const { user, active, electionType } = await assertMobileCollationAccess(activeElectionId, userId);
    const collation = await getLiveElectionService(activeElectionId, userId);
    // Same source set as live chart (getLiveElectionService): approved observers +
    // location filter OR the viewer's own submissions. Geo was previously stricter
    // (hidden:false + exact loc only), so chart could have data while geo was empty.
    // Approved observers' uploads + uploads kept after an observer deleted their account.
    const submitterFilter = await buildCollationSubmitterFilter();
    const loc = buildObserverSubmissionLocationFilter(electionType, user);
    const locationOrSelf = Object.keys(loc).length > 0
        ? { $or: [loc, { user: userId }] }
        : {};
    const resultQuery = {
        election: active._id,
        ...submitterFilter,
        ...locationOrSelf,
    };
    const incidentQuery = {
        election: active._id,
        ...submitterFilter,
        ...locationOrSelf,
    };
    const [rawResults, rawIncidents, rMax, iMax] = await Promise.all([
        ElectionData.find(resultQuery).lean(),
        IncidentReport.find(incidentQuery).lean(),
        ElectionData.find(resultQuery).sort({ updatedAt: -1 }).limit(1).select("updatedAt").lean(),
        IncidentReport.find(incidentQuery).sort({ updatedAt: -1 }).limit(1).select("updatedAt").lean(),
    ]);
    const results = dropSupersededAnonymizedSubmissions(rawResults);
    const incidents = dropSupersededAnonymizedSubmissions(rawIncidents);
    const submitterIds = new Set();
    for (const r of results) {
        if (r.user)
            submitterIds.add(String(r.user));
    }
    for (const i of incidents) {
        if (i.user)
            submitterIds.add(String(i.user));
    }
    const adminTotals = results.reduce((acc, r) => {
        acc.accreditedVoters += Number(r.accreditedVoters ?? 0) || 0;
        acc.rejectedVotes += Number(r.rejectedPapers ?? 0) || 0;
        acc.spoiledBallotPapers += Number(r.spoiledBallotPapers ?? 0) || 0;
        acc.usedBallotPapers += Number(r.usedBallotPapers ?? 0) || 0;
        return acc;
    }, {
        accreditedVoters: 0,
        rejectedVotes: 0,
        spoiledBallotPapers: 0,
        usedBallotPapers: 0,
    });
    const lastFromResults = rMax[0]?.updatedAt;
    const lastFromIncidents = iMax[0]?.updatedAt;
    const lastSyncCandidates = [active.updatedAt, lastFromResults, lastFromIncidents].filter(Boolean);
    const lastSyncAt = lastSyncCandidates.length > 0
        ? new Date(Math.max(...lastSyncCandidates.map((d) => new Date(d).getTime())))
        : null;
    const electionRef = active.election;
    // Build geo from the same live `result` that powers the chart (not a second query).
    const geoBreakdown = buildMobileGeoBreakdown({
        electionType: electionRef?.electionType,
        user,
        liveResult: collation.result,
        results: results,
        incidents: incidents,
    });
    return {
        electionDetails: collation.electionDetails,
        result: collation.result,
        incidentReport: collation.incidentReport,
        sentimentAnalysis: collation.sentimentAnalysis,
        geoBreakdown,
        overview: {
            lastSyncAt,
            resultsUploadedCount: results.length,
            incidentsReportedCount: incidents.length,
            distinctObserverSubmitters: submitterIds.size,
            administrativeFiguresFromReports: adminTotals,
            officialInecAggregate: {
                status: "not_recorded",
                value: null,
            },
        },
        meta: {
            activeElectionId: String(active._id),
            electionType: electionRef?.electionType,
            electionName: electionRef?.electionName,
            electionLocation: active.electionLocation,
            mockElection: active.mockElection ?? false,
            startDate: active.startDate,
            endDate: active.endDate,
        },
    };
};
//# sourceMappingURL=collationBundleService.js.map