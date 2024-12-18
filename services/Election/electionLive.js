import CompletedUser from "../../models/CompletedUser.js";
import Election from "../../models/Election/Election.js";
import ElectionData from "../../models/Election/ElectionData.js";
import Notification from "../../models/DailyTraffic/Notification.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import lgaData from "../../data/lgaData.json" assert { type: "json" };
import AllState from "../../state-data/state.json" assert { type: "json" };
import AllLga from "../../state-data/lga.json" assert { type: "json" };
import AllWard from "../../state-data/wards.json" assert { type: "json" };
import moment from "moment";


// Service to get all ongoing election results
export const getAllOngoingElectionResults = async (userId) => {
  try {
    const user = await CompletedUser.findById(userId).lean();
    if (!user) throw new Error("User not found");

    const ongoingElections = await Election.find({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).lean();

    if (!ongoingElections || ongoingElections.length === 0) {
      return { message: "No ongoing election results" };
    }

    const prioritizedTypes = [
      "national", 
      "gubernatorial",
      "senatorial",
      "house-of-representatives",
      "house-of-assembly",
      "lga",
    ];

    for (let electionType of prioritizedTypes) {
      const selectedElection = ongoingElections.find(
        (election) => election.electionType === electionType
      );

      if (selectedElection) {
        const result = await handleElectionResult(selectedElection, user);
        if (result && !result.message) {
          return {
            electionDetails: {
              electionType: selectedElection.electionType,
              electionName: selectedElection.electionName,
              startDate: selectedElection.startDate,
              endDate: selectedElection.endDate,
            },
            result,
          };
        }
      }
    }

    return { message: "No ongoing election results" };
  } catch (error) {
    console.error("Error fetching ongoing election results:", error);
    throw new Error(`Error fetching election details: ${error.message}`);
  }
};

// Helper function to handle election result fetching based on the election type
const handleElectionResult = async (selectedElection, user) => {
  if (selectedElection.electionType === "national") {
    return await fetchGroupedElectionResults(
      selectedElection._id,
      "state",
      7,
      true // Include overall aggregate analysis in each state's aggregateAnalysis
    );
  } else if (selectedElection.electionType === "gubernatorial") {
    return await fetchGroupedElectionResults(
      selectedElection._id,
      "state",
      7,
      false,
      true // Include per-state aggregate analysis
    );
  } else {
    const electionResults = await ElectionData.find({
      election: selectedElection._id,
      userRole: "observer",
    }).lean();

    if (electionResults.length > 0) {
      const { chart, aggregateAnalysis } = getTopPartiesOverall(electionResults, 7);
      const footer = computeFooter(
        electionResults,
        "lga",
        selectedElection,
        user
      );
      const restriction = determineRestriction(
        selectedElection.electionType,
        user
      );

      return {
        chart,
        aggregateAnalysis,
        footer,
        restriction,
      };
    }
  }
  return { message: "No results available for this election" };
};

// Fetch grouped election results with optional aggregate analysis per grouping
const fetchGroupedElectionResults = async (
  electionId,
  groupBy,
  topN,
  includeOverallAggregate = false,
  includeStateAggregate = false
) => {
  const electionResults = await ElectionData.find({
    election: electionId,
    userRole: "observer",
  }).lean();

  return groupByStateAndAggregate(
    electionResults,
    groupBy,
    topN,
    includeOverallAggregate,
    includeStateAggregate
  );
};

// Groups election results by state and includes aggregate analysis if needed
const groupByStateAndAggregate = (
  results,
  groupBy,
  topN,
  includeOverallAggregate,
  includeStateAggregate
) => {
  const aggregated = {};
  const overallAggregateAnalysis = {};

  results.forEach((result) => {
    const key = result[groupBy];

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
    const result = {
      [groupBy]: key,
      chart: topParties,
    };

    if (includeStateAggregate) {
      result.aggregateAnalysis = topParties.reduce((acc, partyObj) => {
        const party = Object.keys(partyObj)[1];
        acc[party] = partyObj[party];
        return acc;
      }, {});
    } else if (includeOverallAggregate) {
      result.aggregateAnalysis = { ...overallAggregateAnalysis };
    }

    return result;
  });

  return resultArray;
};

// Get top N parties with vote counts for the chart
const getTopNParties = (partiesVotes, topN) => {
  return Object.entries(partiesVotes)
    .sort(([, aVotes], [, bVotes]) => bVotes - aVotes)
    .slice(0, topN)
    .map(([party, votes]) => ({ party, [party]: votes }));
};

// Calculate top seven parties for non-grouped elections
const getTopPartiesOverall = (results, topN) => {
  const totalVotesByParty = {};

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
const determineRestriction = (electionType, user) => {
  if (electionType === "senatorial") {
    return {
      name: "Senatorial District",
      value: getSenatorialDistrict(user.lga) || "Unknown",
    };
  } else if (electionType === "house-of-representatives") {
    return {
      name: "House of Reps District",
      value: getHouseOfRepsDistrict(user.lga) || "Unknown",
    };
  } else if (electionType === "lga") {
    return { name: "Ward", value: user.ward };
  }
  return null;
};

// Calculate footer for registered and submitted locations
const computeFooter = (data, groupBy, election, user) => {
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
      const stateLGAs =
        AllLga.find((state) => state.state.toLowerCase() === user.state.toLowerCase())?.lgas || [];
      registeredLocations = new Set(stateLGAs);
      break;
    case "lga":
      const lgaWards =
        AllWard.find((state) => state.state.toLowerCase() === user.state.toLowerCase())
          ?.lgas.find((lga) => lga.lga.toLowerCase() === user.lga.toLowerCase())?.wards || [];
      registeredLocations = new Set(lgaWards);
      break;
    default:
      registeredLocations = new Set();
  }

  submittedLocations = new Set(
    data.filter((item) => item.partiesVotes?.length || item.selectIncident).map((item) => item[groupBy])
  );

  return {
    [`registered-${groupBy}s`]: registeredLocations.size,
    [`submitted-${groupBy}s`]: submittedLocations.size,
  };
};


// // Service to get live election details for a specific election

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
          value: getSenatorialDistrict(user.lga) || "Unknown",
        };
        break;
      case "house-of-representatives":
        groupBy = "lga";
        restriction = {
          name: "House of Reps District",
          value: getHouseOfRepsDistrict(user.lga) || "Unknown",
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

    // Fetch election results and sentiment analysis based on location and grouping
    const electionResults = await ElectionData.find({
      election: electionId,
      userRole: "observer",
      ...(election.electionType === "gubernatorial" ||
      election.electionType === "house-of-assembly"
        ? { state: user.state }
        : election.electionType === "senatorial"
        ? { lga: { $in: getLGAsInSenatorialDistrict(user.lga) } }
        : election.electionType === "house-of-representatives"
        ? { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga) } }
        : election.electionType === "lga"
        ? { ward: user.ward }
        : {}),
    }).lean();

    if (electionResults.length > 0) {
      const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(
        electionResults,
        groupBy,
        election.electionType
      );

      const sentimentData = await getSentimentAnalysisService(
        electionId,
        groupBy,
        user,
        election
      );

      result =
        election.electionType === "national"
          ? resultData.map((stateResult) => ({
              ...stateResult,
              aggregateAnalysis, // Overall aggregate analysis added to each state
              footer: calculateFooter(electionResults, groupBy, election, user), // Add footer specific to each state
            }))
          : {
              chart: resultData,
              footer: calculateFooter(electionResults, groupBy, election, user),
              aggregateAnalysis,
              restriction,
            };

      sentimentAnalysis = {
        chart: sentimentData.chart,
        aggregateAnalysis: aggregateCombinedSentiment(electionResults),
      };
    }

    // Fetch incident reports, restricted by the user's location for non-presidential elections
    const incidents = await IncidentReport.find({
      election: electionId,
      userRole: "observer",
      ...(election.electionType === "gubernatorial" ||
      election.electionType === "house-of-assembly"
        ? { state: user.state }
        : election.electionType === "senatorial"
        ? { lga: { $in: getLGAsInSenatorialDistrict(user.lga) } }
        : election.electionType === "house-of-representatives"
        ? { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga) } }
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

// Aggregates election results and calculates the top seven parties for each grouping level (state, lga, or ward)
const aggregateResultsAndTopParties = (results, groupBy, electionType) => {
  const aggregated = {};
  const totalVotesByParty = {};

  results.forEach((result) => {
    const { state, partiesVotes, userRole } = result;
    if (userRole !== "observer") return;

    const key = groupBy === "state" ? state : null;

    if (!aggregated[key]) {
      aggregated[key] = { partiesVotes: {} };
    }

    partiesVotes.forEach(({ party, count }) => {
      aggregated[key].partiesVotes[party] =
        (aggregated[key].partiesVotes[party] || 0) + count;

      // Update total aggregate analysis
      totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
    });
  });

  // Prepare result data as array of state objects with top parties
  const resultData =
    electionType === "national"
      ? Object.entries(aggregated).map(([state, data]) => ({
          state,
          chart: getTopSevenParties(data.partiesVotes), 
        }))
      : getTopSevenParties(totalVotesByParty); 

  return {
    resultData,
    aggregateAnalysis: totalVotesByParty,
  };
};

// Extracts the top seven parties with vote counts
const getTopSevenParties = (partiesVotes) => {
  return Object.entries(partiesVotes)
    .sort(([, aVotes], [, bVotes]) => bVotes - aVotes)
    .slice(0, 7)
    .map(([party, votes]) => ({
      party,
      [party]: votes,
    }));
};


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


// Aggregates incident reports based on location and incident type
const aggregateIncidentsByLocation = (incidents, groupBy) => {
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

  return { chart, aggregateAnalysis: totalIncidentCounts };
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
      : election.electionType === "senatorial" ||
        election.electionType === "house-of-representatives"
      ? { lga: user.lga } // Restrict to user's LGA for senatorial or house of reps
      : election.electionType === "lga"
      ? { ward: user.ward } // Restrict to user's ward for lga elections
      : {}),
  }).lean();

  // Combine and aggregate sentiment data
  const combinedSentiment = aggregateCombinedSentiment(electionData);

  return {
    chart: combinedSentiment, // Return combined sentiment analysis
  };
};

// Helper Function to Aggregate Combined Sentiment Data
const aggregateCombinedSentiment = (results) => {
  const combinedSentiment = {
    voteRating: { good: 0, okay: 0, poor: 0 },
    voterIntimidation: { yes: 0, no: 0 },
    voteBuying: { yes: 0, no: 0 },
  };

  results.forEach((result) => {
    const { voteRating, voterIntimidation, voteBuying, userRole } = result;

    if (userRole !== "observer") return;

    if (voteRating) {
      combinedSentiment.voteRating[voteRating] =
        (combinedSentiment.voteRating[voteRating] || 0) + 1;
    }

    if (voterIntimidation) {
      combinedSentiment.voterIntimidation[voterIntimidation] =
        (combinedSentiment.voterIntimidation[voterIntimidation] || 0) + 1;
    }

    if (voteBuying) {
      combinedSentiment.voteBuying[voteBuying] =
        (combinedSentiment.voteBuying[voteBuying] || 0) + 1;
    }
  });

  return combinedSentiment;
};



// Helper function to calculate the footer for registered and submitted locations

const calculateFooter = (data, groupBy, election, user) => {
  let registeredLocations = new Set();
  let submittedLocations = new Set();

  switch (election.electionType) {
    case "national":
      // Register all states for a national election
      registeredLocations = new Set(
        AllState.map((state) => state.toUpperCase())
      );
      break;
    case "senatorial":
    case "house-of-representatives":
      const districtData = lgaData.find(
        (lga) => lga.name.toUpperCase() === user.lga.toUpperCase()
      );
      // Register LGAs within the user's senatorial or house district
      registeredLocations = new Set(
        lgaData
          .filter(
            (lga) =>
              lga.senatorial_district === districtData?.senatorial_district
          )
          .map((lga) => lga.name)
      );
      break;
    case "gubernatorial":
    case "house-of-assembly":
      // Register all LGAs in the user's state
      const stateLGAs =
        AllLga.find(
          (state) => state.state.toLowerCase() === user.state.toLowerCase()
        )?.lgas || [];
      registeredLocations = new Set(stateLGAs);
      break;
    case "lga":
      // Register all wards in the user's LGA
      const lgaWards =
        AllWard.find(
          (state) => state.state.toLowerCase() === user.state.toLowerCase()
        )?.lgas.find((lga) => lga.lga.toLowerCase() === user.lga.toLowerCase())
          ?.wards || [];
      registeredLocations = new Set(lgaWards);
      break;
    default:
      registeredLocations = new Set();
  }

  // Calculate submitted locations based on unique entries in data
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
    const totalApprovedResults = await ElectionData.countDocuments({
      isApproved: true,
    });

    // Pending results count considering `isObserverInPollingUnit`
    const totalPendingResults = await ElectionData.aggregate([
      { $match: { isApproved: false, userRole: "observer" } },
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
        $count: "totalPendingResults",
      },
    ]);

    const pendingResultsCount =
      totalPendingResults.length > 0
        ? totalPendingResults[0].totalPendingResults
        : 0;

    const activityBoard = {
      "all the total result submitted": totalResults,
      "all the total result submitted by observer": totalObserverResults,
      "all the total result submitted by volunteer": totalVolunteerResults,
      "all the total approved result": totalApprovedResults,
      "all the total pending approved result": pendingResultsCount,
    };

    // Fetch the top 10 most recent notifications
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return { activityBoard, notifications };
  } catch (error) {
    throw new Error(
      `Error fetching activity board and notifications: ${error.message}`
    );
  }
};



