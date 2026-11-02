import CompletedUser from "../../models/CompletedUser.ts";
import Election from "../../models/Election/Election.ts";
import ElectionData from "../../models/Election/ElectionData.ts";
import Notification from "../../models/DailyTraffic/Notification.ts";
import IncidentReport from "../../models/Election/IncidentReport.ts";
import lgaData from "../../data/lgaData.json" with { type: "json" };
import AllState from "../../state-data/state.json" with { type: "json" };
import AllLga from "../../state-data/lga.json" with { type: "json" };
import AllWard from "../../state-data/wards.json" with { type: "json" };
import ActiveElection from "../../models/Election/ActiveElection.ts";
import type { Types } from "mongoose";
import {
  buildCollationSubmitterFilter,
  dropSupersededAnonymizedSubmissions,
} from "../../utils/observerSubmissions.ts";

type PartyVote = { party: string; count: number };
type ElectionResultItem = {
  userRole?: string;
  state?: string;
  lga?: string;
  ward?: string;
  partiesVotes: PartyVote[];
  voteRating?: string;
  voterIntimidation?: string;
  voteBuying?: string;
};
type ElectionRef = { electionType: string; electionName?: string };
type ActiveElectionLite = {
  election: ElectionRef;
  results: ElectionResultItem[];
  mockElection?: boolean;
  electionLocation?: unknown;
  startDate?: Date;
  endDate?: Date;
};
type Viewer = { state?: string | null; lga?: string | null; ward?: string | null };

type Id = Types.ObjectId | string;
type GroupByField = "state" | "lga" | "ward";

type PartiesVoteMap = Record<string, number>;
type AggregatedPartiesBucket = { partiesVotes: PartiesVoteMap };

type FooterSourceRow = {
  partiesVotes?: PartyVote[];
  selectIncident?: string;
  state?: string;
  lga?: string;
  ward?: string;
};

type LgaStateEntry = { state: string; lgas: string[] };
type WardLgaEntry = { lga: string; wards: string[] };
type WardStateEntry = { state: string; lgas: WardLgaEntry[] };

type LeanElectionDataRow = {
  state?: string;
  lga?: string;
  ward?: string;
  partiesVotes?: PartyVote[];
  userRole?: string;
  voteRating?: string;
  voterIntimidation?: string;
  voteBuying?: string;
};

type ActiveElectionLeanDoc = {
  _id: Types.ObjectId;
  election: ElectionRef;
  mockElection?: boolean;
  electionLocation?: unknown;
  startDate?: Date;
  endDate?: Date;
};



const INCIDENT_COUNT_TEMPLATE: Record<string, number> = {
  "Ballot Stuffing": 0,
  "Thuggery & Violence": 0,
  "Underage Voting": 0,
  "INEC Misconduct": 0,
  "Result Alteration": 0,
  "Voter Intimidation": 0,
  "Late Opening": 0,
  "Missing Materials": 0,
  "Other Incidents": 0,
  // Legacy web values
  "Thuggery and Violence": 0,
  "Lack of electoral materials": 0,
  "Fraudulent electoral officers": 0,
  "Late commencement": 0,
  "Over voting": 0,
  Other: 0,
};

function emptyIncidentCounts(): Record<string, number> {
  return { ...INCIDENT_COUNT_TEMPLATE };
}

function bumpIncidentCount(row: Record<string, number>, selectIncident: string) {
  if (Object.prototype.hasOwnProperty.call(row, selectIncident)) {
    row[selectIncident]++;
  }
}

// Service to get all ongoing election results
export const getAllOngoingElectionResults = async (userId: string) => {
  try {
    const user = await CompletedUser.findById(userId).lean();
    if (!user) throw new Error("User not found");

    let ongoingElections = await ActiveElection.find({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })
      .populate("election", "electionType electionName")
      .populate("results")
      .lean();

    if (!ongoingElections || ongoingElections.length === 0) {
      return { message: "No ongoing election results" };
    }

    const prioritizedTypes = [
      "national",
      "senatorial",
      "house-of-representatives",
      "gubernatorial",
      "house-of-assembly",
      "lga",
    ];
    const typedOngoingElections = (ongoingElections as unknown as ActiveElectionLite[]).filter(
      (a) => a.results.filter((r) => r.userRole === "observer").length > 0
    );

    if (typedOngoingElections.length) {
      typedOngoingElections.sort(function (a, b) {
        return (
          prioritizedTypes.indexOf(a.election.electionType.toLowerCase()) -
          prioritizedTypes.indexOf(b.election.electionType.toLowerCase())
        );
      });
      const highestPriorityElection = typedOngoingElections.at(0);
      if (!highestPriorityElection) {
        return { message: "No ongoing election results" };
      }
      const highestPriorityType = highestPriorityElection.election.electionType.toLowerCase();
      const highestPriorityName = highestPriorityElection.election.electionName;
      const priorityOngoingElections = typedOngoingElections.filter(
        (a) => a.election.electionType.toLowerCase() === highestPriorityType
      );

      const priorityOngoingElectionsResults = priorityOngoingElections
        .map((a) => a.results)
        .flat();
      const result = await handleElectionResult(
        priorityOngoingElectionsResults as ElectionResultItem[],
        highestPriorityElection.election,
        user
      );

      return {
        electionDetails: {
          electionType: highestPriorityType,
          electionName: highestPriorityName,
          mockElection: highestPriorityElection.mockElection,
          electionLocation: highestPriorityElection.electionLocation,
          startDate: highestPriorityElection.startDate,
          endDate: highestPriorityElection.endDate,
        },
        result,
      };
    } else {
      return { message: "No ongoing election results" };
    }

  } catch (error) {
    console.error("Error fetching ongoing election results:", error);
    throw new Error(`Error fetching election details: ${error.message}`);
  }
};

// Helper function to handle election result fetching based on the election type
const handleElectionResult = async (
  results: ElectionResultItem[],
  election: ElectionRef,
  user: Viewer
) => {
  // console.log(results.length, election);
  if (!election?.electionType) {
    console.warn("Election type is missing in selected election.");
    return { message: "Election type not found" };
  }


  if (election.electionType === "national") {
    return await fetchGroupedElectionResults(
      results,
      "state",
      7,
      true
    );
  } else if (election.electionType === "gubernatorial") {
    return await fetchGroupedElectionResults(
      results,
      "state",
      7,
      false,
      true
    );
  } else {
    if (results.length > 0) {
      const { chart, aggregateAnalysis } = getTopPartiesOverall(results, 7);
      const footer = computeFooter(results, "lga", election, user);
      const restriction = determineRestriction(election.electionType, user);

      // console.log({ chart, aggregateAnalysis, footer, restriction });

      return {
        chart,
        aggregateAnalysis,
        footer,
        restriction,
      };
    }
  }



  // console.log("No results available for this election.");
  return { message: "No results available for this election" };
};


// Fetch grouped election results with optional aggregate analysis per grouping
const fetchGroupedElectionResults = async (
  results: ElectionResultItem[],
  groupBy: "state" | "lga" | "ward",
  topN: number,
  includeOverallAggregate = false,
  includeStateAggregate = false
) => {

  return groupByStateAndAggregate(
    results,
    groupBy,
    topN,
    includeOverallAggregate,
    includeStateAggregate
  );
};

// Groups election results by state and includes aggregate analysis if needed
const groupByStateAndAggregate = (
  results: ElectionResultItem[],
  groupBy: "state" | "lga" | "ward",
  topN: number,
  includeOverallAggregate: boolean,
  includeStateAggregate: boolean
) => {
  const aggregated: Record<string, AggregatedPartiesBucket> = {};
  const overallAggregateAnalysis: Record<string, number> = {};

  results.forEach((result) => {
    const key = String(result[groupBy] ?? "unknown");

    if (!aggregated[key]) {
      aggregated[key] = { partiesVotes: {} };
    }

    result.partiesVotes.forEach(({ party, count }) => {
      aggregated[key].partiesVotes[party] =
        (aggregated[key].partiesVotes[party] || 0) + count;

      if (includeOverallAggregate) {
        overallAggregateAnalysis[party] =
          (overallAggregateAnalysis[party] || 0) + count;
      }
    });
  });

  const resultArray = Object.entries(aggregated).map(([key, data]) => {
    const topParties = getTopNParties(data.partiesVotes, topN);
    const result: Record<string, unknown> = {
      [groupBy]: key,
      chart: topParties,
    };

    if (includeStateAggregate) {
      result.aggregateAnalysis = topParties.reduce<Record<string, number>>(
        (acc, partyObj) => {
          const p = partyObj.party;
          acc[p] = Number(partyObj[p] ?? 0);
          return acc;
        },
        {}
      );
    } else if (includeOverallAggregate) {
      result.aggregateAnalysis = { ...overallAggregateAnalysis };
    }

    return result;
  });

  return resultArray;
};

// Get top N parties with vote counts for the chart
const getTopNParties = (partiesVotes: Record<string, number>, topN: number) => {
  return Object.entries(partiesVotes)
    .sort(([, aVotes], [, bVotes]) => Number(bVotes) - Number(aVotes))
    .slice(0, topN)
    .map(([party, votes]) => ({ party, [party]: votes }));
};

// Calculate top seven parties for non-grouped elections
const getTopPartiesOverall = (results: ElectionResultItem[], topN: number) => {
  const totalVotesByParty: Record<string, number> = {};

  results.forEach((result) => {
    result.partiesVotes.forEach(({ party, count }) => {
      totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
    });
  });

  const chart = getTopNParties(totalVotesByParty, topN);
  return {
    chart,
    aggregateAnalysis: totalVotesByParty,
  };
};

// Define determineRestriction to handle restriction for other election types
const determineRestriction = (electionType: string, user: Viewer) => {
  const lgaKey = user.lga ?? "";
  if (electionType === "senatorial") {
    return {
      name: "Senatorial District",
      value: getSenatorialDistrict(lgaKey) || "Unknown",
    };
  } else if (electionType === "house-of-representatives") {
    return {
      name: "House of Reps District",
      value: getHouseOfRepsDistrict(lgaKey) || "Unknown",
    };
  } else if (electionType === "lga") {
    return { name: "Ward", value: user.ward };
  }
  return null;
};

// Calculate footer for registered and submitted locations
const computeFooter = (
  data: FooterSourceRow[],
  groupBy: GroupByField,
  election: ElectionRef,
  user: Viewer
) => {
  if (!election) {
    console.error("Invalid activeElection object:", election);
    throw new Error("Active election details are missing.");
  }

  let registeredLocations = new Set();
  let submittedLocations = new Set();

  switch (election.electionType) {
    case "national":
      registeredLocations = new Set(
        AllState.map((state) => state.toUpperCase())
      );
      break;
    case "senatorial":
    case "house-of-representatives":
      const districtData = lgaData.find(
        (lga) =>
          lga.name.toUpperCase() === (user.lga ?? "").toUpperCase()
      );
      if (districtData) {
        registeredLocations = new Set(
          lgaData
            .filter(
              (lga) =>
                lga.senatorial_district === districtData.senatorial_district
            )
            .map((lga) => lga.name)
        );
      }
      break;
    case "gubernatorial":
    case "house-of-assembly":
      const stateLGAs =
        AllLga.find(
          (state) =>
            state.state.toLowerCase() === (user.state ?? "").toLowerCase()
        )?.lgas || [];
      registeredLocations = new Set(stateLGAs);
      break;
    case "lga":
      const lgaWards =
        AllWard.find(
          (state) =>
            state.state.toLowerCase() === (user.state ?? "").toLowerCase()
        )?.lgas.find(
          (lga) => lga.lga.toLowerCase() === (user.lga ?? "").toLowerCase()
        )
          ?.wards || [];
      registeredLocations = new Set(lgaWards);
      break;
    default:
      registeredLocations = new Set();
  }

  submittedLocations = new Set(
    data
      .filter((item) => item.partiesVotes?.length || item.selectIncident)
      .map((item) => item[groupBy])
  );

  return {
    [`registered-${groupBy}s`]: registeredLocations.size,
    [`submitted-${groupBy}s`]: submittedLocations.size,
  };
};

// Service to get live election details for a specific election

export const getLiveElectionService = async (
  electionId: Id,
  userId: Id,
  options?: { includeVolunteerSubmissions?: boolean }
) => {
  try {
    const user = await CompletedUser.findById(userId).lean();
    if (!user) throw new Error("User not found");

    const activeElection = await ActiveElection.findById(electionId)
      .populate("election", "electionType electionName")
      .lean();
    if (!activeElection) throw new Error("Election not found");
    const electionRef = activeElection.election as unknown as ElectionRef;

    let groupBy: GroupByField = "lga";
    let restriction = null;

    switch (electionRef?.electionType) {
      case "national":
      case "presidential":
        groupBy = "state";
        break;
      case "senatorial":
        groupBy = "lga";
        restriction = {
          name: "Senatorial District",
          value: getSenatorialDistrict(user.lga ?? "") || "Unknown",
        };
        break;
      case "house-of-representatives":
        groupBy = "lga";
        restriction = {
          name: "House of Reps District",
          value: getHouseOfRepsDistrict(user.lga ?? "") || "Unknown",
        };
        break;
      case "gubernatorial":
      case "house-of-assembly":
        groupBy = "lga";
        restriction = { name: "State", value: user.state };
        break;
      case "lga":
      case "local-government":
      case "local_government":
        groupBy = "ward";
        restriction = { name: "LGA", value: user.lga };
        break;
      default:
        groupBy = "lga";
    }

    let result = null;
    let incidentReport = null;
    let sentimentAnalysis = null;

    // Fetch election results and sentiment analysis based on location and grouping
    // Approved observers' uploads + uploads kept after an observer deleted their account.
    const submitterFilter = await buildCollationSubmitterFilter();

    const scopedFilter = buildObserverSubmissionLocationFilter(
      electionRef?.electionType,
      user
    );
    const electionResults = dropSupersededAnonymizedSubmissions(
      await ElectionData.find({
        election: activeElection._id,
        ...submitterFilter,
        ...(Object.keys(scopedFilter).length > 0
          ? { $or: [scopedFilter, { user: userId }] }
          : {}),
      }).lean()
    );

    if (electionResults.length > 0) {
      const { resultData, regions, aggregateAnalysis, overallChart } =
        aggregateResultsAndTopParties(
          electionResults as unknown as LeanElectionDataRow[],
          groupBy,
          electionRef?.electionType
        );

      const sentimentData = await getSentimentAnalysisService(
        electionId,
        groupBy,
        user,
        activeElection as unknown as ActiveElectionLeanDoc
      );

      const footer = calculateFooter(
        electionResults as FooterSourceRow[],
        groupBy,
        activeElection as unknown as ActiveElectionLeanDoc,
        user as Viewer
      );

      result =
        electionRef?.electionType === "national" ||
        electionRef?.electionType === "presidential"
          ? (resultData as Array<Record<string, unknown>>).map(
              (stateResult) => ({
                ...stateResult,
                aggregateAnalysis,
                footer,
              })
            )
          : {
              chart: overallChart ?? resultData,
              regions: regions.map((r) => ({
                [groupBy]: r.regionKey,
                regionKey: r.regionKey,
                chart: r.chart,
                partiesVotes: r.partiesVotes,
                resultsCount: r.resultsCount,
              })),
              footer,
              aggregateAnalysis,
              restriction,
            };

      sentimentAnalysis = {
        chart: sentimentData.chart,
        aggregateAnalysis: aggregateCombinedSentiment(
          electionResults as unknown as LeanElectionDataRow[]
        ),
      };
    }

    // Fetch incident reports, restricted by the user's location for non-presidential elections
    const incidents = dropSupersededAnonymizedSubmissions(
      await IncidentReport.find({
        election: electionId,
        ...submitterFilter,
        ...(Object.keys(scopedFilter).length > 0
          ? { $or: [scopedFilter, { user: userId }] }
          : {}),
      }).lean()
    );

    if (incidents.length > 0) {
      const {
        chart: incidentChart,
        aggregateAnalysis: incidentAggregateAnalysis,
      } = aggregateIncidentsByLocation(
        incidents as unknown as LeanIncidentRow[],
        groupBy
      );

      incidentReport = {
        chart: incidentChart,
        footer: calculateFooter(
          incidents as FooterSourceRow[],
          groupBy,
          activeElection as unknown as ActiveElectionLeanDoc,
          user as Viewer
        ),
        aggregateAnalysis: incidentAggregateAnalysis,
        restriction,
      };
    }

    return {
      electionDetails: {
        electionType: electionRef?.electionType,
        electionName: electionRef?.electionName,
        mockElection: activeElection.mockElection,
        electionLocation: activeElection.electionLocation,
        startDate: activeElection.startDate,
        endDate: activeElection.endDate,
      },
      result,
      incidentReport,
      sentimentAnalysis,
    };
  } catch (error) {
    throw new Error(`Error fetching election details: ${error.message}`);
  }
};

// Aggregates election results by geo level (state / lga / ward) — same math for all
// election types. Overall chart totals = sum of regional party votes.
export const aggregateElectionResultsByGeo = (
  results: LeanElectionDataRow[],
  groupBy: GroupByField
) => {
  const aggregated: Record<
    string,
    { partiesVotes: PartiesVoteMap; resultsCount: number }
  > = {};
  const totalVotesByParty: PartiesVoteMap = {};

  for (const result of results) {
    const role = String(result.userRole ?? "observer").toLowerCase().trim();
    if (role && role !== "observer") continue;
    if (!result.partiesVotes?.length) continue;

    const rawKey = result[groupBy];
    const fallbackKey =
      (rawKey != null && String(rawKey).trim() !== ""
        ? String(rawKey).trim()
        : null) ||
      (result.lga != null && String(result.lga).trim() !== ""
        ? String(result.lga).trim()
        : null) ||
      (result.state != null && String(result.state).trim() !== ""
        ? String(result.state).trim()
        : null) ||
      (result.ward != null && String(result.ward).trim() !== ""
        ? String(result.ward).trim()
        : null) ||
      "Unknown";

    if (!aggregated[fallbackKey]) {
      aggregated[fallbackKey] = { partiesVotes: {}, resultsCount: 0 };
    }
    aggregated[fallbackKey].resultsCount += 1;

    for (const entry of result.partiesVotes) {
      const party = entry?.party;
      if (!party) continue;
      const votes =
        Number(
          (entry as { count?: unknown; votes?: unknown }).count ??
            (entry as { votes?: unknown }).votes
        ) || 0;
      if (votes <= 0) continue;
      aggregated[fallbackKey].partiesVotes[party] =
        (aggregated[fallbackKey].partiesVotes[party] || 0) + votes;
      totalVotesByParty[party] = (totalVotesByParty[party] || 0) + votes;
    }
  }

  const regions = Object.entries(aggregated).map(([region, data]) => ({
    regionKey: region,
    regionName: region,
    partiesVotes: data.partiesVotes,
    resultsCount: data.resultsCount,
    chart: getTopSevenParties(data.partiesVotes),
  }));

  regions.sort((a, b) => {
    const aTotal = Object.values(a.partiesVotes).reduce((s, n) => s + n, 0);
    const bTotal = Object.values(b.partiesVotes).reduce((s, n) => s + n, 0);
    return bTotal - aTotal;
  });

  return {
    groupBy,
    regions,
    aggregateAnalysis: totalVotesByParty,
    overallChart: getTopSevenParties(totalVotesByParty),
  };
};

/** @deprecated Prefer aggregateElectionResultsByGeo — kept for call-site compatibility. */
const aggregateResultsAndTopParties = (
  results: LeanElectionDataRow[],
  groupBy: GroupByField,
  electionType: string | undefined
) => {
  const geo = aggregateElectionResultsByGeo(results, groupBy);

  // National: array of per-state charts (existing web/mobile contract).
  // Others: overall chart = sum of all regions (existing contract), plus regions.
  const resultData =
    electionType === "national" || electionType === "presidential"
      ? geo.regions.map((r) => ({
          state: r.regionKey,
          chart: r.chart,
        }))
      : geo.overallChart;

  return {
    resultData,
    regions: geo.regions,
    aggregateAnalysis: geo.aggregateAnalysis,
    overallChart: geo.overallChart,
  };
};

// Extracts the top seven parties with vote counts
const getTopSevenParties = (partiesVotes: PartiesVoteMap) => {
  return Object.entries(partiesVotes)
    .sort(([, aVotes], [, bVotes]) => Number(bVotes) - Number(aVotes))
    .slice(0, 7)
    .map(([party, votes]) => ({
      party,
      [party]: votes,
    }));
};

const getSenatorialDistrict = (userLGA: string) => {
  const districtData = lgaData.find(
    (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
  );
  return districtData?.senatorial_district;
};

// Helper function to fetch House of Reps District using lgaData
const getHouseOfRepsDistrict = (userLGA: string) => {
  const districtData = lgaData.find(
    (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
  );
  return districtData?.house_of_representatives;
};

// Helper function to get LGAs in the user's Senatorial District
const getLGAsInSenatorialDistrict = (userLGA: string) => {
  const districtData = lgaData.find(
    (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
  );
  return lgaData
    .filter(
      (lga) => lga.senatorial_district === districtData?.senatorial_district
    )
    .map((lga) => lga.name);
};

// Helper function to get LGAs in the user's House of Reps District
const getLGAsInHouseOfRepsDistrict = (userLGA: string) => {
  const districtData = lgaData.find(
    (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
  );
  return lgaData
    .filter(
      (lga) =>
        lga.house_of_representatives === districtData?.house_of_representatives
    )
    .map((lga) => lga.name);
};

/** Mongo filter for observer result/incident rows visible in collation for this user. */
export const buildObserverSubmissionLocationFilter = (
  electionType: string | undefined,
  user: { state?: string | null; lga?: string | null; ward?: string | null }
): Record<string, unknown> => {
  if (!electionType) return {};
  const t = electionType.toLowerCase();
  if (t === "gubernatorial" || t === "house-of-assembly") {
    return { state: user.state };
  }
  if (t === "senatorial") {
    return { lga: { $in: getLGAsInSenatorialDistrict(user.lga || "") } };
  }
  if (t === "house-of-representatives") {
    return { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga || "") } };
  }
  if (t === "lga") {
    return { ward: user.ward };
  }
  return {};
};

export const observerSubmissionDocMatchesLocationFilter = (
  doc: { state?: string | null; lga?: string | null; ward?: string | null },
  electionType: string | undefined,
  user: { state?: string | null; lga?: string | null; ward?: string | null }
): boolean => {
  const f = buildObserverSubmissionLocationFilter(electionType, user);
  if (Object.keys(f).length === 0) return true;
  if ("state" in f && f.state != null) {
    return String(doc.state ?? "").trim() === String(f.state).trim();
  }
  if (
    "lga" in f &&
    f.lga &&
    typeof f.lga === "object" &&
    "$in" in (f.lga as object)
  ) {
    const list = (f.lga as { $in: string[] }).$in.map((x) => String(x));
    return list.includes(String(doc.lga ?? ""));
  }
  if ("ward" in f && f.ward != null) {
    return String(doc.ward ?? "").trim() === String(f.ward).trim();
  }
  return true;
};

type LeanIncidentRow = {
  state?: string;
  lga?: string;
  ward?: string;
  selectIncident?: string | null;
};

// Aggregates incident reports based on location and incident type
const aggregateIncidentsByLocation = (
  incidents: LeanIncidentRow[],
  groupBy: GroupByField
) => {
  const aggregated: Record<string, Record<string, number>> = {};
  const totalIncidentCounts = emptyIncidentCounts();

  incidents.forEach((incident) => {
    const { state, lga, ward, selectIncident } = incident;
    if (selectIncident == null || selectIncident === "") return;
    const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;
    if (key == null) return;

    if (!aggregated[key]) {
      aggregated[key] = emptyIncidentCounts();
    }

    bumpIncidentCount(aggregated[key], selectIncident);
    bumpIncidentCount(totalIncidentCounts, selectIncident);
  });

  const chart = Object.entries(aggregated).map(([locKey, counts]) => ({
    [groupBy]: locKey,
    ...counts,
  }));

  return { chart, aggregateAnalysis: totalIncidentCounts };
};

// Helper function to aggregate sentiment analysis restricted to user's location

export const getSentimentAnalysisService = async (
  electionId: Id,
  groupBy: GroupByField = "state",
  user: Viewer,
  activeElection: ActiveElectionLeanDoc
) => {
  // Restrict sentiment analysis to user's location if it's not a national election
  const electionData = await ElectionData.find({
    election: activeElection._id,
    userRole: "observer",
    ...buildObserverSubmissionLocationFilter(activeElection.election.electionType, user),
  }).lean();

  // Combine and aggregate sentiment data
  const combinedSentiment = aggregateCombinedSentiment(
    electionData as LeanElectionDataRow[]
  );

  return {
    chart: combinedSentiment, // Return combined sentiment analysis
  };
};

// Helper Function to Aggregate Combined Sentiment Data
const aggregateCombinedSentiment = (results: LeanElectionDataRow[]) => {
  const voteRating: Record<string, number> = { good: 0, okay: 0, poor: 0 };
  const voterIntimidation: Record<string, number> = { yes: 0, no: 0 };
  const voteBuying: Record<string, number> = { yes: 0, no: 0 };

  results.forEach((result) => {
    const { voteRating: vr, voterIntimidation: vi, voteBuying: vb, userRole } =
      result;

    if (userRole !== "observer") return;

    if (vr) {
      voteRating[vr] = (voteRating[vr] || 0) + 1;
    }

    if (vi) {
      voterIntimidation[vi] = (voterIntimidation[vi] || 0) + 1;
    }

    if (vb) {
      voteBuying[vb] = (voteBuying[vb] || 0) + 1;
    }
  });

  return {
    voteRating,
    voterIntimidation,
    voteBuying,
  };
};

// Helper function to calculate the footer for registered and submitted locations

const calculateFooter = (
  data: FooterSourceRow[],
  groupBy: GroupByField,
  activeElection: ActiveElectionLeanDoc,
  user: Viewer
) => {
  if (!activeElection || !activeElection.election) {
    console.error("Invalid activeElection object:", activeElection);
    throw new Error("Active election details are missing.");
  }

  let registeredLocations = new Set<string>();
  let submittedLocations = new Set<string | undefined>();

  switch (activeElection.election.electionType) {
    case "national":
      registeredLocations = new Set(
        (AllState as string[]).map((state) => String(state).toUpperCase())
      );
      break;
    case "senatorial":
    case "house-of-representatives":
      const districtDataCalc = lgaData.find(
        (lga) =>
          lga.name.toUpperCase() === (user.lga ?? "").toUpperCase()
      );
      if (districtDataCalc) {
        registeredLocations = new Set(
          lgaData
            .filter(
              (lga) =>
                lga.senatorial_district === districtDataCalc.senatorial_district
            )
            .map((lga) => lga.name)
        );
      }
      break;
    case "gubernatorial":
    case "house-of-assembly":
      const stateLGAs =
        (AllLga as LgaStateEntry[]).find(
          (s) => s.state.toLowerCase() === user.state?.toLowerCase()
        )?.lgas || [];
      registeredLocations = new Set(stateLGAs);
      break;
    case "lga":
      const lgaWards =
        (AllWard as WardStateEntry[])
          .find((s) => s.state.toLowerCase() === user.state?.toLowerCase())
          ?.lgas.find((lga) => lga.lga.toLowerCase() === user.lga?.toLowerCase())
          ?.wards || [];
      registeredLocations = new Set(lgaWards);
      break;
    default:
      registeredLocations = new Set();
  }

  submittedLocations = new Set(
    data
      .filter((item) => item.partiesVotes?.length || item.selectIncident)
      .map((item) => item[groupBy])
  );

  return {
    [`registered-${groupBy}s`]: registeredLocations.size,
    [`submitted-${groupBy}s`]: submittedLocations.size,
  };
};

export const getActivityBoardAndNotificationsService = async () => {
  try {
    // Total number of results
    const totalResults = await ElectionData.countDocuments({});

    // Aggregate observer results based on the `isObserverInPollingUnit` field
    const observerResultsAggregation = await ElectionData.aggregate([
      { $match: { userRole: "observer" } },
      {
        $lookup: {
          from: "completedusers",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $group: {
          _id: null,
          totalObserverInPollingUnit: {
            $sum: {
              $cond: [
                { $eq: ["$userDetails.isObserverInPollingUnit", true] },
                1,
                0,
              ],
            },
          },
          totalObserverNotInPollingUnit: {
            $sum: {
              $cond: [
                { $eq: ["$userDetails.isObserverInPollingUnit", false] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Determine counts from aggregation results
    const totalObserverResults =
      observerResultsAggregation.length > 0
        ? observerResultsAggregation[0].totalObserverInPollingUnit
        : 0;
    const observerActingAsVolunteers =
      observerResultsAggregation.length > 0
        ? observerResultsAggregation[0].totalObserverNotInPollingUnit
        : 0;

    // Traditional volunteer results count
    const traditionalVolunteerResults = await ElectionData.countDocuments({
      userRole: "volunteer",
    });

    // Combine observers acting as volunteers with traditional volunteers
    const totalVolunteerResults =
      observerActingAsVolunteers + traditionalVolunteerResults;

    // Approved results count
    // const totalApprovedResults = await ElectionData.countDocuments({
    //   isApproved: true,
    // });

    // Pending results count considering `isObserverInPollingUnit`
    const totalUploadResults = await ElectionData.aggregate([
      { $match: { userRole: "observer" } },
      {
        $lookup: {
          from: "completedusers",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $match: {
          "userDetails.isObserverInPollingUnit": true,
        },
      },
      {
        $count: "totalUploadResults",
      },
    ]);

    const pendingResultsCount =
      totalUploadResults.length > 0
        ? totalUploadResults[0].totalUploadResults
        : 0;

    const activityBoard = {
      "all the total result submitted": totalResults,
      "all the total result submitted by observer": totalObserverResults,
      "all the total result submitted by volunteer": totalVolunteerResults,
      "all the total approved result": pendingResultsCount,
      // "all the total pending approved result": pendingResultsCount,
    };

    // Fetch the top 10 most recent notifications
    const notifications = await Notification.find({
      $or: [
        { recipients: { $exists: false } },
        { recipients: "all" }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .select("-readBy");

    return { activityBoard, notifications };
  } catch (error) {
    throw new Error(
      `Error fetching activity board and notifications: ${error.message}`
    );
  }
};
