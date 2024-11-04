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

// Updated service

// export const getLiveElectionService = async (electionId, userId) => {
//   try {
//     const user = await CompletedUser.findById(userId).lean();
//     if (!user) throw new Error("User not found");

//     const election = await Election.findById(electionId).lean();
//     if (!election) throw new Error("Election not found");

//     let groupBy = "lga";
//     let restriction = null;

//     switch (election.electionType) {
//       case "national":
//         groupBy = "state";
//         break;
//       case "senatorial":
//         groupBy = "lga";
//         restriction = {
//           name: "Senatorial District",
//           value: getSenatorialDistrict(user.lga) || "Unknown",
//         };
//         break;
//       case "house-of-representatives":
//         groupBy = "lga";
//         restriction = {
//           name: "House of Reps District",
//           value: getHouseOfRepsDistrict(user.lga) || "Unknown",
//         };
//         break;
//       case "gubernatorial":
//       case "house-of-assembly":
//         groupBy = "lga";
//         restriction = { name: "State", value: user.state };
//         break;
//       case "lga":
//         groupBy = "ward";
//         restriction = { name: "LGA", value: user.lga };
//         break;
//       default:
//         groupBy = "lga";
//     }

//     let result = null;
//     let incidentReport = null;
//     let sentimentAnalysis = null;

//     // Fetch election results and sentiment analysis (restricted to user's location)
//     const electionResults = await ElectionData.find({
//       election: electionId,
//       userRole: "observer",
//       ...(election.electionType === "gubernatorial" ||
//       election.electionType === "house-of-assembly"
//         ? { state: user.state }
//         : election.electionType === "senatorial"
//         ? { lga: { $in: getLGAsInSenatorialDistrict(user.lga) } }
//         : election.electionType === "house-of-representatives"
//         ? { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga) } }
//         : election.electionType === "lga"
//         ? { ward: user.ward }
//         : {}),
//     }).lean();

//     if (electionResults.length > 0) {
//       const { chart: resultChart, aggregateAnalysis: resultAggregateAnalysis } =
//         aggregateResultsAndTopParties(electionResults, groupBy);

//       const sentimentData = await getSentimentAnalysisService(
//         electionId,
//         groupBy,
//         user,
//         election
//       );

//       result = {
//         chart: resultChart,
//         footer: calculateFooter(electionResults, groupBy, election, user),
//         aggregateAnalysis: resultAggregateAnalysis,
//         restriction,
//       };

//       sentimentAnalysis = {
//         chart: sentimentData.chart,
//         aggregateAnalysis: sentimentData.aggregateAnalysis,
//       };
//     }

//     // Fetch incident reports (restricted to user's location)
//     const incidents = await IncidentReport.find({
//       election: electionId,
//       userRole: "observer",
//       ...(election.electionType === "gubernatorial" ||
//       election.electionType === "house-of-assembly"
//         ? { state: user.state }
//         : election.electionType === "senatorial"
//         ? { lga: { $in: getLGAsInSenatorialDistrict(user.lga) } }
//         : election.electionType === "house-of-representatives"
//         ? { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga) } }
//         : election.electionType === "lga"
//         ? { ward: user.ward }
//         : {}),
//     }).lean();

//     if (incidents.length > 0) {
//       const {
//         chart: incidentChart,
//         aggregateAnalysis: incidentAggregateAnalysis,
//       } = aggregateIncidentsByLocation(incidents, groupBy);

//       incidentReport = {
//         chart: incidentChart,
//         footer: calculateFooter(incidents, groupBy, election, user),
//         aggregateAnalysis: incidentAggregateAnalysis,
//         restriction,
//       };
//     }

//     return {
//       electionDetails: {
//         electionType: election.electionType,
//         electionName: election.electionName,
//         startDate: election.startDate,
//         endDate: election.endDate,
//       },
//       result,
//       incidentReport,
//       sentimentAnalysis,
//     };
//   } catch (error) {
//     throw new Error(`Error fetching election details: ${error.message}`);
//   }
// };

// Function to fetch ongoing election results with rotation
// export const getAllOngoingElectionResults = async (userId) => {
//   try {
//     const user = await CompletedUser.findById(userId).lean();
//     if (!user) throw new Error("User not found");

//     // Fetch ongoing elections
//     const ongoingElections = await Election.find({
//       startDate: { $lte: new Date() },
//       endDate: { $gte: new Date() },
//     }).lean();

//     if (!ongoingElections || ongoingElections.length === 0) {
//       return { message: "No ongoing election results" };
//     }

//     // Prioritize election types
//     const prioritizedTypes = [
//       "national",
//       "senatorial",
//       "gubernatorial",
//       "house-of-representatives",
//       "house-of-assembly",
//       "lga",
//     ];

//     // Check for each election type in priority order and return the first available result
//     for (let electionType of prioritizedTypes) {
//       const selectedElection = ongoingElections.find(
//         (election) => election.electionType === electionType
//       );

//       if (selectedElection) {
//         const result = await handleElectionResult(selectedElection, user);
//         if (result && !result.message) {
//           return result;
//         }
//       }
//     }

//     return { message: "No ongoing election results" };
//   } catch (error) {
//     console.error("Error fetching ongoing election results:", error);
//     throw new Error(`Error fetching election details: ${error.message}`);
//   }
// };

export const getAllOngoingElectionResults = async (userId) => {
  try {
    const user = await CompletedUser.findById(userId).lean();
    if (!user) throw new Error("User not found");

    // Fetch ongoing elections
    const ongoingElections = await Election.find({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).lean();

    if (!ongoingElections || ongoingElections.length === 0) {
      return { message: "No ongoing election results" };
    }

    // Prioritize election types
    const prioritizedTypes = [
      "national", // Presidential comes first
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
  let result = null;

  if (selectedElection.electionType === "national") {
    // Presidential Election: Grouped by state with state-based aggregate analysis
    result = await fetchGroupedElectionResults(
      selectedElection._id,
      "state",
      7,
      false, // No overall aggregate for presidential
      true // Include state aggregate analysis
    );
    return result.chart;
  } else if (selectedElection.electionType === "gubernatorial") {
    // Gubernatorial Election: Grouped by state with state-based aggregate analysis
    result = await fetchGroupedElectionResults(
      selectedElection._id,
      "state",
      7,
      false,
      true // Include state aggregate analysis
    );
    return result.chart;
  } else {
    // Other Elections: No grouping, single chart of top seven parties with overall aggregate analysis
    const electionResults = await ElectionData.find({
      election: selectedElection._id,
      userRole: "observer",
    }).lean();

    if (electionResults.length > 0) {
      const { chart, aggregateAnalysis } = aggregateResultsAndTopParties(
        electionResults,
        "lga",
        7
      );
      return {
        chart,
        aggregateAnalysis,
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

  const groupedResults = groupByStateAndAggregate(
    electionResults,
    groupBy,
    topN,
    includeOverallAggregate,
    includeStateAggregate
  );

  return groupedResults;
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

  results.forEach((result) => {
    const key = result[groupBy];

    if (!aggregated[key]) {
      aggregated[key] = { partiesVotes: {} };
    }

    result.partiesVotes.forEach(({ party, count }) => {
      aggregated[key].partiesVotes[party] =
        (aggregated[key].partiesVotes[party] || 0) + count;
    });
  });

  const chart = Object.entries(aggregated).map(([key, data]) => {
    const topParties = getTopNParties(data.partiesVotes, topN);
    const result = {
      [groupBy]: key,
      chart: topParties, // Top parties for each state in `chart` array format
    };

    if (includeStateAggregate) {
      result.aggregateAnalysis = topParties.reduce((acc, partyObj) => {
        const party = Object.keys(partyObj)[1];
        acc[party] = partyObj[party];
        return acc;
      }, {});
    }
    return result;
  });

  return { chart };
};

// Get top N parties with vote counts for the chart
const getTopNParties = (partiesVotes, topN) => {
  return Object.entries(partiesVotes)
    .sort(([, aVotes], [, bVotes]) => bVotes - aVotes)
    .slice(0, topN)
    .map(([party, votes]) => ({ party, [party]: votes }));
};




// Service to get live election details for a specific election
// export const getLiveElectionService = async (electionId, userId) => {
//   try {
//     const user = await CompletedUser.findById(userId).lean();
//     if (!user) throw new Error("User not found");

//     const election = await Election.findById(electionId).lean();
//     if (!election) throw new Error("Election not found");

//     let groupBy = "lga";
//     let restriction = null;

//     switch (election.electionType) {
//       case "national":
//         groupBy = "state";
//         break;
//       case "senatorial":
//         groupBy = "lga";
//         restriction = {
//           name: "Senatorial District",
//           value: getSenatorialDistrict(user.lga) || "Unknown",
//         };
//         break;
//       case "house-of-representatives":
//         groupBy = "lga";
//         restriction = {
//           name: "House of Reps District",
//           value: getHouseOfRepsDistrict(user.lga) || "Unknown",
//         };
//         break;
//       case "gubernatorial":
//       case "house-of-assembly":
//         groupBy = "lga";
//         restriction = { name: "State", value: user.state };
//         break;
//       case "lga":
//         groupBy = "ward";
//         restriction = { name: "LGA", value: user.lga };
//         break;
//       default:
//         groupBy = "lga";
//     }

//     let result = null;
//     let incidentReport = null;
//     let sentimentAnalysis = null;

//     // Fetch election results and sentiment analysis based on location and grouping
//     const electionResults = await ElectionData.find({
//       election: electionId,
//       userRole: "observer",
//       ...(election.electionType === "gubernatorial" ||
//       election.electionType === "house-of-assembly"
//         ? { state: user.state }
//         : election.electionType === "senatorial"
//         ? { lga: { $in: getLGAsInSenatorialDistrict(user.lga) } }
//         : election.electionType === "house-of-representatives"
//         ? { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga) } }
//         : election.electionType === "lga"
//         ? { ward: user.ward }
//         : {}),
//     }).lean();

//     if (electionResults.length > 0) {
//       const { chart: resultChart, aggregateAnalysis: resultAggregateAnalysis } =
//         aggregateResultsAndTopParties(
//           electionResults,
//           groupBy,
//           election.electionType
//         );

//       const sentimentData = await getSentimentAnalysisService(
//         electionId,
//         groupBy,
//         user,
//         election
//       );

//       result = {
//         chart: resultChart,
//         footer: calculateFooter(electionResults, groupBy, election, user),
//         aggregateAnalysis: resultAggregateAnalysis,
//         restriction,
//       };

//       sentimentAnalysis = {
//         chart: sentimentData.chart,
//         aggregateAnalysis: sentimentData.aggregateAnalysis,
//       };
//     }

//     // Fetch incident reports, restricted by the user's location for non-presidential elections
//     const incidents = await IncidentReport.find({
//       election: electionId,
//       userRole: "observer",
//       ...(election.electionType === "gubernatorial" ||
//       election.electionType === "house-of-assembly"
//         ? { state: user.state }
//         : election.electionType === "senatorial"
//         ? { lga: { $in: getLGAsInSenatorialDistrict(user.lga) } }
//         : election.electionType === "house-of-representatives"
//         ? { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga) } }
//         : election.electionType === "lga"
//         ? { ward: user.ward }
//         : {}),
//     }).lean();

//     if (incidents.length > 0) {
//       const {
//         chart: incidentChart,
//         aggregateAnalysis: incidentAggregateAnalysis,
//       } = aggregateIncidentsByLocation(incidents, groupBy);

//       incidentReport = {
//         chart: incidentChart,
//         footer: calculateFooter(incidents, groupBy, election, user),
//         aggregateAnalysis: incidentAggregateAnalysis,
//         restriction,
//       };
//     }

//     return {
//       electionDetails: {
//         electionType: election.electionType,
//         electionName: election.electionName,
//         startDate: election.startDate,
//         endDate: election.endDate,
//       },
//       result,
//       incidentReport,
//       sentimentAnalysis,
//     };
//   } catch (error) {
//     throw new Error(`Error fetching election details: ${error.message}`);
//   }
// };

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
      const { chart: resultChart, aggregateAnalysis: resultAggregateAnalysis } =
        aggregateResultsAndTopParties(
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
      result: election.electionType === "national" ? [result] : result, // Ensure presidential result is returned as an array
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

  // Get top seven parties overall for aggregate analysis
  const overallTopSevenParties = getTopSevenParties(totalVotesByParty);

  // Prepare chart data without aggregateAnalysis in each state for Presidential
  const chart =
    electionType === "national"
      ? Object.entries(aggregated).map(([state, data]) => ({
          state,
          chart: getTopSevenParties(data.partiesVotes),
        }))
      : overallTopSevenParties;

  return {
    chart,
    aggregateAnalysis: totalVotesByParty,
  };
};


const getTopSevenParties = (partiesVotes) => {
  return Object.entries(partiesVotes)
    .sort(([, aVotes], [, bVotes]) => bVotes - aVotes)
    .slice(0, 7)
    .map(([party, votes]) => ({
      party,
      [party]: votes,
    }));
};



// Fetch gubernatorial results for all states
const fetchGubernatorialResults = async (electionId) => {
  try {
    // Aggregate data by state
    const stateResults = await ElectionData.aggregate([
      { $match: { election: electionId, userRole: "observer" } },
      { $group: { _id: "$state", stateResults: { $push: "$$ROOT" } } },
    ]);

    console.log("State Results Aggregated:", stateResults);

    // Get the election details to pass to calculateFooter
    const election = await Election.findById(electionId).lean();

    return await Promise.all(
      stateResults.map(async ({ _id: state, stateResults }) => {
        const { chart, aggregateAnalysis } = aggregateResultsAndTopParties(
          stateResults,
          "lga"
        );

        // Correctly pass the parameters to calculateFooter
        return {
          state,
          chart,
          footer: calculateFooter(
            stateResults,
            "lga",
            election, // Pass the election object
            { state } // Use state-level restriction
          ),
          aggregateAnalysis,
        };
      })
    );
  } catch (error) {
    console.error("Error in fetchGubernatorialResults:", error);
    throw new Error(
      `Error in fetching gubernatorial results: ${error.message}`
    );
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

const getTopThreeParties = (partiesVotes) => {
  const sortedParties = Object.entries(partiesVotes)
    .sort(([, aVotes], [, bVotes]) => bVotes - aVotes)
    .filter(([, votes]) => votes > 0);

  const topParties = {};
  let includedParties = 0;

  for (let i = 0; i < sortedParties.length; i++) {
    const [party, count] = sortedParties[i];
    if (includedParties < 3) {
      topParties[party] = count;
      includedParties++;
    } else {
      break;
    }
  }

  return topParties;
};

const getTopParties = (partiesVotes, topN = 7) => {
  const sortedParties = Object.entries(partiesVotes).sort(
    ([, aVotes], [, bVotes]) => bVotes - aVotes
  );

  const topParties = {};
  let includedParties = 0;

  for (let i = 0; i < sortedParties.length; i++) {
    const [party, count] = sortedParties[i];
    if (includedParties < topN) {
      topParties[party] = count;
      includedParties++;
    } else if (
      count === sortedParties[topN - 1][1] &&
      includedParties === topN
    ) {
      break;
    } else {
      break;
    }
  }

  return topParties;
};

// Aggregates election results and calculates the top three parties for each grouping level (state, lga, or ward)
// const aggregateResultsAndTopParties = (results, groupBy = "state") => {
//   const aggregated = {};
//   const totalVotesByParty = {};

//   // Step 1: Aggregate votes and calculate total votes per party across all results
//   results.forEach((result) => {
//     const { state, lga, ward, partiesVotes, userRole } = result;

//     if (userRole !== "observer") return;

//     const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

//     if (!aggregated[key]) {
//       aggregated[key] = { totalVotes: 0, partiesVotes: {} };
//     }

//     // Aggregate votes for each party
//     partiesVotes.forEach(({ party, count }) => {
//       aggregated[key].partiesVotes[party] =
//         (aggregated[key].partiesVotes[party] || 0) + count;
//       aggregated[key].totalVotes += count;

//       // Accumulate total votes across all results for each party
//       totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
//     });
//   });

//   // Step 2: Get the top three parties overall based on aggregated vote counts
//   const overallTopThreeParties = Object.keys(totalVotesByParty)
//     .sort((a, b) => totalVotesByParty[b] - totalVotesByParty[a])
//     .slice(0, 3);

//   // Step 3: Prepare chart data by including only locations where the local top parties are part of the overall top three
//   const chart = Object.entries(aggregated)
//     .map(([key, data]) => {
//       const localTopParties = getTopThreeParties(data.partiesVotes);
//       const filteredParties = {};

//       // Include only the parties that are in the overall top three
//       for (const [party, count] of Object.entries(localTopParties)) {
//         if (overallTopThreeParties.includes(party)) {
//           filteredParties[party] = count;
//         }
//       }

//       // Return the result only if there is at least one matching top party
//       if (Object.keys(filteredParties).length > 0) {
//         return {
//           [groupBy]: key,
//           ...filteredParties,
//         };
//       }

//       return null;
//     })
//     .filter(Boolean); // Remove any null entries

//   // Step 4: Prepare the aggregate analysis (total votes for each party) and sort it
//   const aggregateAnalysis = Object.entries(totalVotesByParty)
//     .sort(([, aVotes], [, bVotes]) => bVotes - aVotes)
//     .reduce((acc, [party, votes]) => {
//       acc[party] = votes;
//       return acc;
//     }, {});

//   return { chart, aggregateAnalysis };
// };


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


// Aggregates incident reports by location (state, lga, ward)
// const aggregateIncidentsByLocation = (incidents, groupBy = "state") => {
//   const aggregated = {};
//   const totalIncidentCounts = {
//     "Thuggery and Violence": 0,
//     "Lack of electoral materials": 0,
//     "Fraudulent electoral officers": 0,
//     "Late commencement": 0,
//     "Over voting": 0,
//     Other: 0,
//   };

//   incidents.forEach((incident) => {
//     const { state, lga, ward, selectIncident } = incident;

//     // Determine the key based on groupBy (state, lga, or ward)
//     const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

//     // Initialize the aggregated structure if it doesn't exist
//     if (!aggregated[key]) {
//       aggregated[key] = {
//         "Thuggery and Violence": 0,
//         "Lack of electoral materials": 0,
//         "Fraudulent electoral officers": 0,
//         "Late commencement": 0,
//         "Over voting": 0,
//         Other: 0,
//       };
//     }

//     // Aggregate the incidents for the selected location
//     aggregated[key][selectIncident]++;
//     totalIncidentCounts[selectIncident]++; 
//   });

//   // Prepare the chart data for each location
//   const chart = Object.entries(aggregated).map(([key, incidents]) => ({
//     [groupBy]: key,
//     ...incidents,
//   }));

//   return {
//     chart, 
//     aggregateAnalysis: totalIncidentCounts, 
//   };
// };

// Helper function to calculate the footer for registered and submitted locations
const calculateFooter = (data, groupBy, election, user) => {
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
        (lga) => lga.name.toUpperCase() === user.lga.toUpperCase()
      );
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
      const stateLGAs =
        AllLga.find(
          (state) => state.state.toLowerCase() === user.state.toLowerCase()
        )?.lgas || [];
      registeredLocations = new Set(stateLGAs);
      break;
    case "lga":
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



