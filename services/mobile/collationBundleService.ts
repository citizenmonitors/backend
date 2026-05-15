import type { Types } from "mongoose";
import ActiveElection from "../../models/Election/ActiveElection.ts";
import ElectionData from "../../models/Election/ElectionData.ts";
import IncidentReport from "../../models/Election/IncidentReport.ts";
import CompletedUser from "../../models/CompletedUser.ts";
import {
  getLiveElectionService,
  buildObserverSubmissionLocationFilter,
  observerSubmissionDocMatchesLocationFilter,
} from "../Election/electionLive.ts";
import {
  getResultsAndPerformAction,
  type FlagMediaFiles,
} from "../Election/electionService.ts";
import { isActiveElectionRelevantForUser } from "../../utils/electionRelevanceForUser.ts";

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

  const loc = buildObserverSubmissionLocationFilter(electionType, user);

  const resultQuery = {
    election: active._id,
    userRole: "observer",
    hidden: false,
    ...loc,
  };
  const incidentQuery = {
    election: active._id,
    userRole: "observer",
    hidden: false,
    ...loc,
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

  return {
    electionDetails: collation.electionDetails,
    result: collation.result,
    incidentReport: collation.incidentReport,
    sentimentAnalysis: collation.sentimentAnalysis,
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

export const mobileCollationUserAction = async (
  activeElectionId: string,
  userId: Id,
  body: {
    electionId: string;
    action: "agree" | "flag" | "unagree";
    dataType: "election" | "incident";
    flagReason?: string;
  } | null,
  flagMediaFiles?: FlagMediaFiles
) => {
  const { user, electionType } = await assertMobileCollationAccess(activeElectionId, userId);

  if (!body?.action) {
    return getResultsAndPerformAction(userId, null);
  }

  if (body.dataType === "election") {
    const doc = await ElectionData.findById(body.electionId).lean();
    if (!doc || String(doc.election) !== String(activeElectionId)) {
      throw new Error("Result not found for this election");
    }
    if (
      !observerSubmissionDocMatchesLocationFilter(
        doc,
        electionType,
        user
      )
    ) {
      throw new Error("You cannot act on this result from your current location");
    }
  } else if (body.dataType === "incident") {
    const doc = await IncidentReport.findById(body.electionId).lean();
    if (!doc || String(doc.election) !== String(activeElectionId)) {
      throw new Error("Incident report not found for this election");
    }
    if (
      !observerSubmissionDocMatchesLocationFilter(
        doc,
        electionType,
        user
      )
    ) {
      throw new Error("You cannot act on this report from your current location");
    }
  } else {
    throw new Error("Invalid data type");
  }

  return getResultsAndPerformAction(
    userId,
    {
      electionId: body.electionId,
      action: body.action,
      dataType: body.dataType,
      flagReason: body.flagReason,
    },
    flagMediaFiles
  );
};
