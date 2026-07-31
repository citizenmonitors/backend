import type { Types } from "mongoose";
import ActiveElection from "../../models/Election/ActiveElection.ts";
import ElectionData from "../../models/Election/ElectionData.ts";
import IncidentReport from "../../models/Election/IncidentReport.ts";
import CompletedUser from "../../models/CompletedUser.ts";
import {
  getLiveElectionService,
  buildObserverSubmissionLocationFilter,
} from "../Election/electionLive.ts";
import { isActiveElectionRelevantForUser } from "../../utils/electionRelevanceForUser.ts";
import { buildMobileGeoBreakdown } from "./geoBreakdown.ts";

type Id = Types.ObjectId | string;

type ElectionRef = { electionType?: string; electionName?: string };

export const assertMobileCollationAccess = async (activeElectionId: string, userId: Id) => {
  const user = await CompletedUser.findById(userId).lean();
  if (!user) throw new Error("User not found");

  const active = await ActiveElection.findById(activeElectionId)
    .populate("election", "electionType electionName")
    .lean();
  if (!active) throw new Error("Election not found");

  const electionRef = active.election as unknown as ElectionRef | null;
  if (
    !isActiveElectionRelevantForUser(
      electionRef ?? undefined,
      active.electionLocation,
      user
    )
  ) {
    throw new Error("This election is not available for your location");
  }

  return { user, active, electionType: electionRef?.electionType };
};

export const getMobileCollationBundle = async (activeElectionId: string, userId: Id) => {
  const { user, active, electionType } = await assertMobileCollationAccess(activeElectionId, userId);

  const collation = await getLiveElectionService(activeElectionId, userId);

  // Same source set as live chart (getLiveElectionService): approved observers +
  // location filter OR the viewer's own submissions. Geo was previously stricter
  // (hidden:false + exact loc only), so chart could have data while geo was empty.
  const approvedObservers = await CompletedUser.find(
    { role: "observer", isObserverInPollingUnit: true },
    "_id"
  ).lean();
  const approvedObserverIds = approvedObservers.map((u) => u._id);
  const loc = buildObserverSubmissionLocationFilter(electionType, user);
  const locationOrSelf =
    Object.keys(loc).length > 0
      ? { $or: [loc, { user: userId }] }
      : {};

  const resultQuery = {
    election: active._id,
    userRole: "observer",
    user: { $in: approvedObserverIds },
    ...locationOrSelf,
  };
  const incidentQuery = {
    election: active._id,
    userRole: "observer",
    user: { $in: approvedObserverIds },
    ...locationOrSelf,
  };

  const [results, incidents, rMax, iMax] = await Promise.all([
    ElectionData.find(resultQuery).lean(),
    IncidentReport.find(incidentQuery).lean(),
    ElectionData.find(resultQuery).sort({ updatedAt: -1 }).limit(1).select("updatedAt").lean(),
    IncidentReport.find(incidentQuery).sort({ updatedAt: -1 }).limit(1).select("updatedAt").lean(),
  ]);

  const submitterIds = new Set<string>();
  for (const r of results) {
    if (r.user) submitterIds.add(String(r.user));
  }
  for (const i of incidents) {
    if (i.user) submitterIds.add(String(i.user));
  }

  const adminTotals = results.reduce(
    (acc, r) => {
      acc.accreditedVoters += Number(r.accreditedVoters ?? 0) || 0;
      acc.rejectedVotes += Number(r.rejectedPapers ?? 0) || 0;
      acc.spoiledBallotPapers += Number(r.spoiledBallotPapers ?? 0) || 0;
      acc.usedBallotPapers += Number(r.usedBallotPapers ?? 0) || 0;
      return acc;
    },
    {
      accreditedVoters: 0,
      rejectedVotes: 0,
      spoiledBallotPapers: 0,
      usedBallotPapers: 0,
    }
  );

  const lastFromResults = rMax[0]?.updatedAt;
  const lastFromIncidents = iMax[0]?.updatedAt;
  const lastSyncCandidates = [active.updatedAt, lastFromResults, lastFromIncidents].filter(
    Boolean
  ) as Date[];
  const lastSyncAt =
    lastSyncCandidates.length > 0
      ? new Date(Math.max(...lastSyncCandidates.map((d) => new Date(d).getTime())))
      : null;

  const electionRef = active.election as unknown as ElectionRef | null;

  // Build geo from the same live `result` that powers the chart (not a second query).
  const geoBreakdown = buildMobileGeoBreakdown({
    electionType: electionRef?.electionType,
    user,
    liveResult: collation.result,
    results: results as Array<{
      userRole?: string | null;
      state?: string | null;
      lga?: string | null;
      ward?: string | null;
      pollingUnit?: string | null;
      partiesVotes?: Array<{ party: string; count?: number; votes?: number }>;
    }>,
    incidents: incidents as Array<{
      state?: string | null;
      lga?: string | null;
      ward?: string | null;
      pollingUnit?: string | null;
    }>,
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
        status: "not_recorded" as const,
        value: null as number | null,
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
