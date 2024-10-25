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

    // Fetch election results and sentiment analysis (restricted to user's location for senatorial, house of reps, gubernatorial, and lga elections)
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

let lastServedIndex = -1;

// Function to fetch ongoing election results with rotation
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
      "national",
      "senatorial",
      "gubernatorial",
      "house-of-representatives",
      "house-of-assembly",
      "lga",
    ];

    // Check for each election type in priority order and return the first available result
    for (let electionType of prioritizedTypes) {
      const selectedElection = ongoingElections.find(
        (election) => election.electionType === electionType
      );

      if (selectedElection) {
        const result = await handleElectionResult(selectedElection, user);
        if (result && !result.message) {
          return result; 
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
// const handleElectionResult = async (selectedElection, user) => {
//   let groupBy = "lga";
//   let restriction = null;
//   let restrictedLGAs = [];

//   if (selectedElection.electionType === "national") {
//     groupBy = "state";
//   } else if (selectedElection.electionType === "senatorial") {
//     groupBy = "lga";
//     restrictedLGAs = getLGAsInSenatorialDistrict(user.lga);
//     restriction = {
//       name: "Senatorial District",
//       value: getSenatorialDistrict(user.lga) || "Unknown",
//     };
//     if (!restrictedLGAs.length)
//       return { message: "No results for your district" };
//   } else if (selectedElection.electionType === "house-of-representatives") {
//     groupBy = "lga";
//     restrictedLGAs = getLGAsInHouseOfRepsDistrict(user.lga);
//     restriction = {
//       name: "House of Reps District",
//       value: getHouseOfRepsDistrict(user.lga) || "Unknown",
//     };
//     if (!restrictedLGAs.length)
//       return { message: "No results for your district" };
//   } else if (selectedElection.electionType === "gubernatorial") {
//     // Fetch gubernatorial results for all states
//     const statesResults = await fetchGubernatorialResults(selectedElection._id);
//     if (statesResults.length > 0) {
//       return {
//         electionType: selectedElection.electionType,
//         electionName: selectedElection.electionName,
//         startDate: selectedElection.startDate,
//         endDate: selectedElection.endDate,
//         result: statesResults,
//       };
//     }
//     return { message: "No gubernatorial results available" };
//   } else if (selectedElection.electionType === "lga") {
//     groupBy = "ward";
//     restriction = { name: "Ward", value: user.ward };
//   }

//   // Fetch other election results
//   const electionResults = await ElectionData.find({
//     election: selectedElection._id,
//     userRole: "observer",
//     ...(selectedElection.electionType === "gubernatorial" ||
//     selectedElection.electionType === "house-of-assembly"
//       ? { state: user.state }
//       : selectedElection.electionType === "senatorial"
//       ? { lga: { $in: restrictedLGAs } }
//       : selectedElection.electionType === "house-of-representatives"
//       ? { lga: { $in: restrictedLGAs } }
//       : selectedElection.electionType === "lga"
//       ? { ward: user.ward }
//       : {}),
//   }).lean();

//   if (electionResults.length > 0) {
//     const { chart, aggregateAnalysis } = aggregateResultsAndTopParties(
//       electionResults,
//       groupBy
//     );

//     return {
//       electionType: selectedElection.electionType,
//       electionName: selectedElection.electionName,
//       startDate: selectedElection.startDate,
//       endDate: selectedElection.endDate,
//       result: {
//         chart,
//         footer: calculateFooter(
//           electionResults,
//           groupBy,
//           selectedElection,
//           user
//         ),
//         aggregateAnalysis,
//         restriction,
//       },
//     };
//   }

//   return { message: "No results available" };
// };

const handleElectionResult = async (selectedElection, user) => {
  let groupBy = "lga";
  let restriction = null;
  let restrictedLGAs = [];

  if (selectedElection.electionType === "national") {
    groupBy = "state";
  } else if (selectedElection.electionType === "senatorial") {
    groupBy = "lga";
    restrictedLGAs = getLGAsInSenatorialDistrict(user.lga);
    restriction = {
      name: "Senatorial District",
      value: getSenatorialDistrict(user.lga) || "Unknown",
    };
    if (!restrictedLGAs.length)
      return { message: "No results for your district" };
  } else if (selectedElection.electionType === "house-of-representatives") {
    groupBy = "lga";
    restrictedLGAs = getLGAsInHouseOfRepsDistrict(user.lga);
    restriction = {
      name: "House of Reps District",
      value: getHouseOfRepsDistrict(user.lga) || "Unknown",
    };
    if (!restrictedLGAs.length)
      return { message: "No results for your district" };
  } else if (selectedElection.electionType === "gubernatorial") {
    const statesResults = await fetchGubernatorialResults(selectedElection._id);
    if (statesResults.length > 0) {
      return {
        electionType: selectedElection.electionType,
        electionName: selectedElection.electionName,
        startDate: selectedElection.startDate,
        endDate: selectedElection.endDate,
        result: statesResults,
      };
    }
    return { message: "No gubernatorial results available" };
  } else if (selectedElection.electionType === "lga") {
    groupBy = "ward";
    restriction = { name: "Ward", value: user.ward };
  }

  const electionResults = await ElectionData.find({
    election: selectedElection._id,
    userRole: "observer",
    ...(selectedElection.electionType === "gubernatorial" ||
    selectedElection.electionType === "house-of-assembly"
      ? { state: user.state }
      : selectedElection.electionType === "senatorial"
      ? { lga: { $in: restrictedLGAs } }
      : selectedElection.electionType === "house-of-representatives"
      ? { lga: { $in: restrictedLGAs } }
      : selectedElection.electionType === "lga"
      ? { ward: user.ward }
      : {}),
  }).lean();

  if (electionResults.length > 0) {
    const { chart, aggregateAnalysis } = aggregateResultsAndTopParties(
      electionResults,
      groupBy
    );

    return {
      electionType: selectedElection.electionType,
      electionName: selectedElection.electionName,
      startDate: selectedElection.startDate,
      endDate: selectedElection.endDate,
      result: {
        chart,
        footer: calculateFooter(
          electionResults,
          groupBy,
          selectedElection,
          user
        ),
        aggregateAnalysis,
        restriction,
      },
    };
  }

  return { message: "No results available" };
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
// const getTopThreeParties = (partiesVotes) => {
//   const sortedParties = Object.entries(partiesVotes).sort(
//     ([, aVotes], [, bVotes]) => bVotes - aVotes
//   );

//   const topParties = {};
//   for (let i = 0; i < sortedParties.length; i++) {
//     const [party, count] = sortedParties[i];
//     if (Object.keys(topParties).length >= 3 && count !== sortedParties[2][1])
//       break;
//     topParties[party] = count;
//   }

//   return topParties;
// };

const getTopThreeParties = (partiesVotes) => {
  const sortedParties = Object.entries(partiesVotes).sort(
    ([, aVotes], [, bVotes]) => bVotes - aVotes
  );

  const topParties = {};
  let includedParties = 0; // Counter to keep track of how many parties have been included

  for (let i = 0; i < sortedParties.length; i++) {
    const [party, count] = sortedParties[i];
    if (includedParties < 3) {
      topParties[party] = count;
      includedParties++;
    } else if (count === sortedParties[2][1] && includedParties === 3) {
      break;
    } else {
      break; 
    }
  }

  return topParties;
};


// Aggregates election results and calculates the top three parties for each grouping level (state, lga, or ward)
const aggregateResultsAndTopParties = (results, groupBy = "state") => {
  const aggregated = {};
  const totalVotesByParty = {};

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
// const aggregateSentimentAnalysis = (results, groupBy = "state") => {
//   const aggregated = {};

//   results.forEach((result) => {
//     const {
//       state,
//       lga,
//       ward,
//       voteRating,
//       voterIntimidation,
//       voteBuying,
//       userRole,
//     } = result;

//     if (userRole !== "observer") return;

//     // Determine the aggregation key based on the grouping level
//     const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;

//     if (!aggregated[key]) {
//       aggregated[key] = {
//         voteRating: { good: 0, okay: 0, poor: 0 },
//         voterIntimidation: { yes: 0, no: 0 },
//         voteBuying: { yes: 0, no: 0 },
//       };
//     }

//     // Aggregate vote ratings, voter intimidation, and vote buying data
//     if (voteRating) {
//       aggregated[key].voteRating[voteRating]++;
//     }
//     if (voterIntimidation) {
//       aggregated[key].voterIntimidation[voterIntimidation]++;
//     }
//     if (voteBuying) {
//       aggregated[key].voteBuying[voteBuying]++;
//     }
//   });

//   return aggregated;
// };

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
// export const getSentimentAnalysisService = async (
//   electionId,
//   groupBy = "state",
//   user,
//   election
// ) => {
//   // Restrict sentiment analysis to user's location if it's not a national election
//   const electionData = await ElectionData.find({
//     election: electionId,
//     userRole: "observer",
//     ...(election.electionType === "gubernatorial" ||
//     election.electionType === "house-of-assembly"
//       ? { state: user.state } // Restrict to user's state
//       : election.electionType === "senatorial" ||
//         election.electionType === "house-of-representatives"
//       ? { lga: user.lga } // Restrict to user's LGA for senatorial or house of reps
//       : election.electionType === "lga"
//       ? { ward: user.ward } // Restrict to user's ward for lga elections
//       : {}),
//   }).lean();

//   const aggregatedSentiment = aggregateSentimentAnalysis(electionData, groupBy);
//   const sentimentAnalysis = formatSentimentAnalysis(
//     aggregatedSentiment,
//     groupBy
//   );

//   return {
//     chart: sentimentAnalysis,
//     aggregateAnalysis: aggregatedSentiment,
//   };
// };

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

  // Use the new aggregation method
  const aggregatedSentiment = aggregateSentimentAnalysis(electionData);

  return {
    chart: aggregatedSentiment, // Return a single object instead of an array
  };
};

// Updated Helper Function to Aggregate Sentiment Data into a Single Object
const aggregateSentimentAnalysis = (results) => {
  const sentimentAggregate = {
    voteRating: { good: 0, okay: 0, poor: 0 },
    voterIntimidation: { yes: 0, no: 0 },
    voteBuying: { yes: 0, no: 0 },
  };

  results.forEach((result) => {
    const { voteRating, voterIntimidation, voteBuying, userRole } = result;

    if (userRole !== "observer") return;

    if (voteRating) {
      sentimentAggregate.voteRating[voteRating] =
        (sentimentAggregate.voteRating[voteRating] || 0) + 1;
    }

    if (voterIntimidation) {
      sentimentAggregate.voterIntimidation[voterIntimidation] =
        (sentimentAggregate.voterIntimidation[voterIntimidation] || 0) + 1;
    }

    if (voteBuying) {
      sentimentAggregate.voteBuying[voteBuying] =
        (sentimentAggregate.voteBuying[voteBuying] || 0) + 1;
    }
  });

  return sentimentAggregate;
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

    // Approved and pending results counts
    const totalApprovedResults = await ElectionData.countDocuments({
      isApproved: true,
    });
    const totalPendingResults = await ElectionData.countDocuments({
      isApproved: false,
    });

    const activityBoard = {
      "all the total result submitted": totalResults,
      "all the total result submitted by observer": totalObserverResults,
      "all the total result submitted by volunteer": totalVolunteerResults,
      "all the total approved result": totalApprovedResults,
      "all the total pending approved result": totalPendingResults,
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
