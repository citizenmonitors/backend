import CompletedUser from "../../models/CompletedUser.js";
import Election from "../../models/Election/Election.js";
import ElectionData from "../../models/Election/ElectionData.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import lgaData from "../../data/lgaData.json" assert { type: "json" };
import AllState from "../../state-data/state.json" assert { type: "json" };
import AllLga from "../../state-data/lga.json" assert { type: "json" };
import AllWard from "../../state-data/wards.json" assert { type: "json" };

// Updated service

export const getLiveElectionService = async (electionId, userId) => {
  try {
    const user = await CompletedUser.findById(userId).lean();
    if (!user) throw new Error("User not found");

    const election = await Election.findById(electionId).lean();
    if (!election) throw new Error("Election not found");

    let groupBy = "lga";
    switch (election.electionType) {
      case "national":
        groupBy = "state";
        break;
      case "senatorial":
      case "house-of-representatives":
      case "house-of-assembly":
      case "gubernatorial":
        groupBy = "lga";
        break;
      case "lga":
        groupBy = "ward";
        break;
      default:
        groupBy = "lga";
    }

    let result = null;
    let incidentReport = null;
    let sentimentAnalysis = null;

    // Fetch election results
    const electionResults = await ElectionData.find({
      election: electionId,
      userRole: "observer",
    }).lean();

    if (electionResults.length > 0) {
      const { chart: resultChart, aggregateAnalysis: resultAggregateAnalysis } =
        aggregateResultsAndTopParties(electionResults, groupBy);

      const sentimentData = await getSentimentAnalysisService(
        electionId,
        groupBy
      );

      result = {
        chart: resultChart,
        footer: calculateFooter(electionResults, groupBy, election, user),
        aggregateAnalysis: resultAggregateAnalysis,
        restriction: getElectionRestriction(election, user),
      };

      sentimentAnalysis = {
        chart: sentimentData,
        aggregateAnalysis: resultAggregateAnalysis,
      };
    }

    // Fetch incident reports
    const incidents = await IncidentReport.find({
      election: electionId,
    }).lean();

    if (incidents.length > 0) {
      const {
        chart: incidentChart,
        aggregateAnalysis: incidentAggregateAnalysis,
      } = aggregateIncidentsByLocation(incidents, groupBy);

      incidentReport = {
        chart: incidentChart,
        footer: calculateFooter(incidents, groupBy, election, user),
        aggregateAnalysis: incidentAggregateAnalysis,
        restriction: getElectionRestriction(election, user),
      };
    }

    return {
      electionDetails: {
        electionType: election.electionType,
        electionName: election.electionName,
        startDate: election.startDate,
        endDate: election.endDate,
      },
      result,
      incidentReport,
      sentimentAnalysis,
    };
  } catch (error) {
    throw new Error(`Error fetching election details: ${error.message}`);
  }
};


const aggregateResultsAndTopParties = (results, groupBy ) => {
  const aggregated = {};
  const totalVotesByParty = {}; 

  // Step 1: Aggregating votes from polling unit -> ward -> lga -> state
  results.forEach((result) => {
    const { state, lga, ward, partiesVotes, userRole } = result;

    if (userRole !== "observer") return;

    // Determine the aggregation key (state, lga, or ward)
    const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

    if (!aggregated[key]) {
      aggregated[key] = { totalVotes: 0, partiesVotes: {} };
    }

    // Aggregate partiesVotes at the current level
    partiesVotes.forEach(({ party, count }) => {
      aggregated[key].partiesVotes[party] =
        (aggregated[key].partiesVotes[party] || 0) + count;
      aggregated[key].totalVotes += count;
      totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
    });
  });

  // Step 2: Format aggregated results and get top three parties
  const chart = Object.entries(aggregated).map(([key, data]) => ({
    [groupBy]: key,
    ...getTopThreeParties(data.partiesVotes),
  }));

  // Step 3: Aggregate analysis (total votes for each party)
  const aggregateanalysis = Object.keys(totalVotesByParty).reduce(
    (acc, party) => {
      acc[party] = totalVotesByParty[party];
      return acc;
    },
    {}
  );

  return { chart, aggregateanalysis };
};

const getTopThreeParties = (partiesVotes) => {
  const sortedParties = Object.entries(partiesVotes).sort(
    ([, aVotes], [, bVotes]) => bVotes - aVotes
  );

  const topParties = {};
  for (let i = 0; i < sortedParties.length; i++) {
    const [party, count] = sortedParties[i];
    if (Object.keys(topParties).length >= 3 && count !== sortedParties[2][1])
      break;
    topParties[party] = count;
  }

  return topParties;
};

const aggregateIncidentsByLocation = (incidents, groupBy = "state") => {
  const aggregated = {};
  const totalIncidentCounts = {
    "Thuggery and Violence": 0,
    "Lack of electoral materials": 0,
    "Fraudulent electoral officers": 0,
    "Late commencement": 0,
    "Over voting": 0,
    Other: 0,
  };

  incidents.forEach((incident) => {
    const { state, lga, ward, selectIncident } = incident;

    const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

    if (!aggregated[key]) {
      aggregated[key] = {
        "Thuggery and Violence": 0,
        "Lack of electoral materials": 0,
        "Fraudulent electoral officers": 0,
        "Late commencement": 0,
        "Over voting": 0,
        Other: 0,
      };
    }

    aggregated[key][selectIncident]++;
    totalIncidentCounts[selectIncident]++;
  });

  const chart = Object.entries(aggregated).map(([key, incidents]) => ({
    [groupBy]: key,
    ...incidents,
  }));

  return { chart, totalIncidentCounts };
};

const aggregateSentimentAnalysis = (results, groupBy ) => {
  const aggregated = {};

  results.forEach((result) => {
    const {
      state,
      lga,
      ward,
      voteRating,
      voterIntimidation,
      voteBuying,
      userRole,
    } = result;

    if (userRole !== "observer") return;

    const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

    if (!aggregated[key]) {
      aggregated[key] = {
        voteRating: { good: 0, okay: 0, poor: 0 },
        voterIntimidation: { yes: 0, no: 0 },
        voteBuying: { yes: 0, no: 0 },
      };
    }

    if (voteRating) {
      aggregated[key].voteRating[voteRating]++;
    }

    if (voterIntimidation) {
      aggregated[key].voterIntimidation[voterIntimidation]++;
    }

    if (voteBuying) {
      aggregated[key].voteBuying[voteBuying]++;
    }
  });

  return aggregated;
};

const formatSentimentAnalysis = (aggregatedSentiment, groupBy) => {
  return Object.entries(aggregatedSentiment).map(([key, sentimentData]) => ({
    [groupBy]: key,
    voteRating: sentimentData.voteRating,
    voterIntimidation: sentimentData.voterIntimidation,
    voteBuying: sentimentData.voteBuying,
  }));
};

export const getSentimentAnalysisService = async (
  electionId,
  groupBy = "state"
) => {
  const electionData = await ElectionData.find({
    election: electionId,
    userRole: "observer",
  }).lean();

  const aggregatedSentiment = aggregateSentimentAnalysis(electionData, groupBy);
  return formatSentimentAnalysis(aggregatedSentiment, groupBy);
};

// Helper function for restrictions
const getElectionRestriction = (election, user) => {
  const userLGA = user.lga;
  const districtData = lgaData.find(
    (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
  );

  switch (election.electionType) {
    case "senatorial":
      return {
        name: "Senatorial District",
        value: districtData?.senatorial_district || "Unknown",
      };
    case "house-of-representatives":
      return {
        name: "House of Reps District",
        value: districtData?.house_of_representatives || "Unknown",
      };
    case "gubernatorial":
    case "house-of-assembly":
      return { name: "State", value: user.state };
    default:
      return null;
  }
};

// Helper function to calculate the footer for registered and submitted locations
const calculateFooter = (data, groupBy, election, user) => {
  let registeredLocations = new Set();
  let submittedLocations = new Set();

  // Calculate registered locations based on the election type
  switch (election.electionType) {
    case "national":
      // Use AllState.json to get the states
      registeredLocations = new Set(AllState.map((state) => state.toUpperCase()));
      break;
    case "senatorial":
    case "house-of-representatives":
      // Use AllLga.json to get all LGAs in the user's district
      const districtData = lgaData.find(
        (lga) => lga.name.toUpperCase() === user.lga.toUpperCase()
      );
      const districtLGAs = AllLga.find(
        (lga) => lga.state.toLowerCase() === user.state.toLowerCase()
      )?.lgas || [];
      registeredLocations = new Set(districtLGAs);
      break;
    case "gubernatorial":
    case "house-of-assembly":
      // Use AllLga.json to get all LGAs in the user's state
      const stateLGAs = AllLga.find(
        (state) => state.state.toLowerCase() === user.state.toLowerCase()
      )?.lgas || [];
      registeredLocations = new Set(stateLGAs);
      break;
    case "lga":
      // Use Alllward.json to get all wards in the user's LGA
      const lgaWards = AllWard.find(
        (state) => state.state.toLowerCase() === user.state.toLowerCase()
      )?.lgas.find((lga) => lga.lga.toLowerCase() === user.lga.toLowerCase())
        ?.wards || [];
      registeredLocations = new Set(lgaWards);
      break;
    default:
      registeredLocations = new Set();
  }

  // Calculate submitted locations based on the data provided
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

const calculateAggregateAnalysis = (electionResults, incidents) => {
  const aggregateAnalysis = {};

  // Aggregate election result votes by party
  if (electionResults.length > 0) {
    electionResults.forEach((result) => {
      result.partiesVotes.forEach(({ party, count }) => {
        aggregateAnalysis[party] = (aggregateAnalysis[party] || 0) + count;
      });
    });
  }

  // Aggregate incident report counts by type
  if (incidents.length > 0) {
    incidents.forEach((incident) => {
      const { selectIncident } = incident;
      aggregateAnalysis[selectIncident] =
        (aggregateAnalysis[selectIncident] || 0) + 1;
    });
  }

  return aggregateAnalysis;
};


