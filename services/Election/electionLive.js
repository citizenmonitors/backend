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
    let restriction = null;

    switch (election.electionType) {
      case "national":
        groupBy = "state";
        break;
      case "senatorial":
        groupBy = "lga";
        restriction = {
          name: "Senatorial District",
          value: getSenatorialDistrict(user.lga) || "Unknown", // Using lgaData for senatorial district
        };
        break;
      case "house-of-representatives":
        groupBy = "lga";
        restriction = {
          name: "House of Reps District",
          value: getHouseOfRepsDistrict(user.lga) || "Unknown", // Using lgaData for house of reps district
        };
        break;
      case "gubernatorial":
      case "house-of-assembly":
        groupBy = "lga";
        restriction = { name: "State", value: user.state };
        break;
      case "lga":
        groupBy = "ward";
        restriction = { name: "LGA", value: user.lga };
        break;
      default:
        groupBy = "lga";
    }

    let result = null;
    let incidentReport = null;
    let sentimentAnalysis = null;

    // Fetch election results and sentiment analysis (restricted to user's location for senatorial, house of reps, gubernatorial, and lga elections)
    const electionResults = await ElectionData.find({
      election: electionId,
      userRole: "observer",
      ...(election.electionType === "gubernatorial" ||
      election.electionType === "house-of-assembly"
        ? { state: user.state } // Restrict to user's state for gubernatorial and house of assembly
        : election.electionType === "senatorial"
        ? { lga: { $in: getLGAsInSenatorialDistrict(user.lga) } } // Restrict to LGAs in user's senatorial district
        : election.electionType === "house-of-representatives"
        ? { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga) } } // Restrict to LGAs in user's house of reps district
        : election.electionType === "lga"
        ? { ward: user.ward } // Restrict to user's ward for lga elections
        : {}),
    }).lean();

    if (electionResults.length > 0) {
      const { chart: resultChart, aggregateAnalysis: resultAggregateAnalysis } =
        aggregateResultsAndTopParties(electionResults, groupBy);

      const sentimentData = await getSentimentAnalysisService(
        electionId,
        groupBy,
        user,
        election
      );

      result = {
        chart: resultChart,
        footer: calculateFooter(electionResults, groupBy, election, user),
        aggregateAnalysis: resultAggregateAnalysis,
        restriction,
      };

      sentimentAnalysis = {
        chart: sentimentData.chart,
        aggregateAnalysis: sentimentData.aggregateAnalysis,
      };
    }

    // Fetch incident reports (restricted to user's location for senatorial, house of reps, gubernatorial, and lga elections)
    const incidents = await IncidentReport.find({
      election: electionId,
      userRole: "observer",
      ...(election.electionType === "gubernatorial" ||
      election.electionType === "house-of-assembly"
        ? { state: user.state }
        : election.electionType === "senatorial"
        ? { lga: { $in: getLGAsInSenatorialDistrict(user.lga) } } // Restrict to LGAs in user's senatorial district
        : election.electionType === "house-of-representatives"
        ? { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga) } } // Restrict to LGAs in user's house of reps district
        : election.electionType === "lga"
        ? { ward: user.ward }
        : {}),
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
        restriction,
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

// Helper function to fetch Senatorial District using lgaData
const getSenatorialDistrict = (userLGA) => {
  const districtData = lgaData.find(
    (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
  );
  return districtData?.senatorial_district;
};

// Helper function to fetch House of Reps District using lgaData
const getHouseOfRepsDistrict = (userLGA) => {
  const districtData = lgaData.find(
    (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
  );
  return districtData?.house_of_representatives;
};

// Helper function to get LGAs in the user's Senatorial District
const getLGAsInSenatorialDistrict = (userLGA) => {
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
const getLGAsInHouseOfRepsDistrict = (userLGA) => {
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


// Helper function to filter based on election type
const getElectionLocationFilter = (electionType, user) => {
  switch (electionType) {
    case "gubernatorial":
    case "house-of-assembly":
      return { state: user.state }; // Restrict to user's state
    case "senatorial":
    case "house-of-representatives":
      return { lga: user.lga }; // Restrict to user's LGA
    case "lga":
      return { ward: user.ward }; // Restrict to user's ward
    default:
      return {};
  }
};

// Helper function for getting top three parties based on vote counts, considering ties for third place
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

// Aggregates election results and calculates the top three parties for each grouping level (state, lga, or ward)
const aggregateResultsAndTopParties = (results, groupBy = "state") => {
  const aggregated = {};
  const totalVotesByParty = {}; // Track total votes for each party across all results

  results.forEach((result) => {
    const { state, lga, ward, partiesVotes, userRole } = result;

    if (userRole !== "observer") return;

    // Determine the aggregation key based on the grouping level
    const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

    if (!aggregated[key]) {
      aggregated[key] = { totalVotes: 0, partiesVotes: {} };
    }

    // Aggregate parties' votes at the current level
    partiesVotes.forEach(({ party, count }) => {
      aggregated[key].partiesVotes[party] =
        (aggregated[key].partiesVotes[party] || 0) + count;
      aggregated[key].totalVotes += count;

      // Accumulate total votes across all results for each party
      totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
    });
  });

  // Prepare chart data with the top three parties for each grouping key
  const chart = Object.entries(aggregated).map(([key, data]) => ({
    [groupBy]: key,
    ...getTopThreeParties(data.partiesVotes),
  }));

  // Prepare the aggregate analysis (total votes for each party)
  const aggregateAnalysis = Object.keys(totalVotesByParty).reduce(
    (acc, party) => {
      acc[party] = totalVotesByParty[party];
      return acc;
    },
    {}
  );

  return { chart, aggregateAnalysis };
};

// Aggregates sentiment analysis based on vote rating, voter intimidation, and vote buying
const aggregateSentimentAnalysis = (results, groupBy = "state") => {
  const aggregated = {};

  results.forEach((result) => {
    const { state, lga, ward, voteRating, voterIntimidation, voteBuying, userRole } = result;

    if (userRole !== "observer") return;

    // Determine the aggregation key based on the grouping level
    const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

    if (!aggregated[key]) {
      aggregated[key] = {
        voteRating: { good: 0, okay: 0, poor: 0 },
        voterIntimidation: { yes: 0, no: 0 },
        voteBuying: { yes: 0, no: 0 },
      };
    }

    // Aggregate vote ratings, voter intimidation, and vote buying data
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

// Formats the aggregated sentiment analysis into the desired structure
const formatSentimentAnalysis = (aggregatedSentiment, groupBy) => {
  return Object.entries(aggregatedSentiment).map(([key, sentimentData]) => ({
    [groupBy]: key,
    voteRating: sentimentData.voteRating,
    voterIntimidation: sentimentData.voterIntimidation,
    voteBuying: sentimentData.voteBuying,
  }));
};

// Helper function to aggregate sentiment analysis restricted to user's location
export const getSentimentAnalysisService = async (
  electionId,
  groupBy = "state",
  user,
  election
) => {
  // Restrict sentiment analysis to user's location if it's not a national election
  const electionData = await ElectionData.find({
    election: electionId,
    userRole: "observer",
    ...(election.electionType === "gubernatorial" ||
    election.electionType === "house-of-assembly"
      ? { state: user.state } // Restrict to user's state
      : election.electionType === "senatorial" || election.electionType === "house-of-representatives"
      ? { lga: user.lga } // Restrict to user's LGA for senatorial or house of reps
      : election.electionType === "lga"
      ? { ward: user.ward } // Restrict to user's ward for lga elections
      : {}),
  }).lean();

  const aggregatedSentiment = aggregateSentimentAnalysis(electionData, groupBy);
  const sentimentAnalysis = formatSentimentAnalysis(aggregatedSentiment, groupBy);

  return {
    chart: sentimentAnalysis,
    aggregateAnalysis: aggregatedSentiment,
  };
};

// Aggregates incident reports by location (state, lga, ward)
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

    // Determine the key based on groupBy (state, lga, or ward)
    const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

    // Initialize the aggregated structure if it doesn't exist
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

    // Aggregate the incidents for the selected location
    aggregated[key][selectIncident]++;
    totalIncidentCounts[selectIncident]++; // Increment the total incident counts for the aggregate analysis
  });

  // Prepare the chart data for each location
  const chart = Object.entries(aggregated).map(([key, incidents]) => ({
    [groupBy]: key,
    ...incidents,
  }));

  return {
    chart, // Aggregated chart data by location
    aggregateAnalysis: totalIncidentCounts, // Aggregate analysis for all incident types
  };
};


// Helper function for restrictions (for senatorial districts, house of reps districts, and state restrictions)
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

  switch (election.electionType) {
    case "national":
      registeredLocations = new Set(AllState.map((state) => state.toUpperCase()));
      break;
    case "senatorial":
    case "house-of-representatives":
      const districtData = lgaData.find(
        (lga) => lga.name.toUpperCase() === user.lga.toUpperCase()
      );
      registeredLocations = new Set(
        lgaData
          .filter((lga) => lga.senatorial_district === districtData?.senatorial_district)
          .map((lga) => lga.name)
      );
      break;
    case "gubernatorial":
    case "house-of-assembly":
      const stateLGAs = AllLga.find(
        (state) => state.state.toLowerCase() === user.state.toLowerCase()
      )?.lgas || [];
      registeredLocations = new Set(stateLGAs);
      break;
    case "lga":
      const lgaWards = AllWard.find(
        (state) => state.state.toLowerCase() === user.state.toLowerCase()
      )?.lgas.find((lga) => lga.lga.toLowerCase() === user.lga.toLowerCase())
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

// Helper function to calculate the footer for sentiment analysis
const calculateSentimentFooter = (aggregatedSentiment) => {
  const footer = { good: 0, okay: 0, poor: 0, yes: 0, no: 0 };

  for (const sentimentData of Object.values(aggregatedSentiment)) {
    footer.good += sentimentData.voteRating.good;
    footer.okay += sentimentData.voteRating.okay;
    footer.poor += sentimentData.voteRating.poor;
    footer.yes += sentimentData.voterIntimidation.yes;
    footer.no += sentimentData.voterIntimidation.no;
  }

  return footer;
};
