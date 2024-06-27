import Election from "../../models/Election/Election.js";
import ElectionData from "../../models/Election/ElectionData.js";
import CompletedUser from "../../models/CompletedUser.js";
import { politicalParties } from "../../models/Election/PoliticalParty.js";
import IncidentReport from "../../models/Election/IncidentReport.js";


export const createElectionService = async (data) => {
  const { electionType, startDate, endDate } = data;

    const existingElection = await Election.findOne({
      electionType,
      startDate,
      endDate,
    });
    if (existingElection) {
    const error = new Error("Election already exists for this type and date range");
      error.statusCode = 400;
      throw error;
    }
  const election = new Election({ electionType, startDate, endDate });
  return await election.save();
};

export const updateElectionService = async (electionId, data) => {

  const election = await Election.findByIdAndUpdate(electionId, data, {
    new: true,
  });
  if (!election) {
    const error = new Error("Election not found");
    error.statusCode = 404;
    throw error;
  }
  return election;
};

export const getAllElectionsService = async () => {
  const elections = await Election.find().select("-results -incidentReports");
  return elections;

};

export const getElectionResultById = async (electionId, userId) => {
  const election = await Election.findById(electionId).lean();
  if (!election) {
    throw new Error("Election not found");
  }
  const result = await ElectionData.findOne({
    election: electionId,
    user: userId,
  }).lean();
  const incidentReport = await IncidentReport.findOne({
    election: electionId,
    user: userId,
  }).lean();

  const { results, incidentReports, ...electionData } = election;

  if (result || incidentReport) {
    return { election: electionData, result, incidentReport };
  }
};

export const getElectionById = async (electionId) => {
  const election = await Election.findById(electionId).lean();
  if (!election) {
    throw new Error("Election not found");
  }
  const { results, incidentReports, ...electionData } = election;
  return { election: electionData, politicalParties };
};

export const uploadResultDataService = async (electionId, userId, data, files) => {
  try {
    const {
      partiesVotes,
      otherPartiesVotes,
      voterIntimidation,
      voteBuying,
      voteRating,
    } = data;

    // Check if the election exists
    const election = await Election.findById(electionId);
    if (!election) {
      throw new Error("Election not found");
    }

    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user has already uploaded result data for this election
    const existingResult = await ElectionData.findOne({
      election: electionId,
      user: userId,
    });

    if (existingResult) {
      return existingResult;
    }

    // Create new result data
    const electionData = new ElectionData({
      election: electionId,
      user: userId,
      state: user.state,
      lga: user.lga,
      ward: user.ward,
      pollingUnit: user.pollingUnit,
      partiesVotes: JSON.parse(partiesVotes),
      otherPartiesVotes: JSON.parse(otherPartiesVotes),
      voterIntimidation,
      voteBuying,
      resultPictures: files?.resultPictures?.[0]?.path,
      resultVideos: files?.resultVideos?.[0]?.path,
      voteRating,
    });

    return await electionData.save();
  } catch (error) {
    throw new Error(`Error saving election data: ${error.message}`);
  }
  
};

export const updateResultDataService = async (electionId, userId, data, files) => {
    try {

      const {
        partiesVotes,
        otherPartiesVotes,
        voterIntimidation,
        voteBuying,
        voteRating,
      } = data;

      // Check if the election exists
      const electionExists = await Election.findById(electionId);
      if (!electionExists) {
        throw new Error("Election not found");
      }
      // console.log("Election found:", electionExists);

      // Check if the user exists
      const userExists = await CompletedUser.findById(userId);
      if (!userExists) {
        throw new Error("User not found or unauthorized");
      }
      // console.log("User found:", userExists);

      // Find the result data
      const result = await ElectionData.findOne({
        election: electionId,
        user: userId,
      });

      if (!result) {
        throw new Error("Result data not found or unauthorized");
      }
      // console.log("Result data found:", result);

result.partiesVotes = partiesVotes
  ? JSON.parse(partiesVotes)
  : result.partiesVotes;
result.otherPartiesVotes = otherPartiesVotes
  ? JSON.parse(otherPartiesVotes)
  : result.otherPartiesVotes;
result.voterIntimidation =
  voterIntimidation !== undefined
    ? voterIntimidation
    : result.voterIntimidation;
result.voteBuying = voteBuying !== undefined ? voteBuying : result.voteBuying;
result.voteRating = voteRating !== undefined ? voteRating : result.voteRating;

      // Handle file updates
      if (files && files.resultPictures) {
        result.resultPictures = files.resultPictures.map((file) => file.path);
      }
      if (files && files.resultVideos) {
        result.resultVideos = files.resultVideos.map((file) => file.path);
      }

      // Save the updated result
      const updatedResult = await result.save();
      // console.log("Result updated successfully:", updatedResult);

      return updatedResult;
    } catch (error) {
      console.error(`Error: ${error.message}`);
      throw new Error(`Failed to update result data: ${error.message}`);
    }
};

export const getUserElectionData = async (userId) => {
  return await ElectionData.find({ user: userId }).populate("election");
};

export const deleteUserElectionData = async (dataId, userId) => {
  const electionData = await ElectionData.findOne({
    _id: dataId,
    user: userId,
  });
  if (!electionData) {
    throw new Error("Election data not found or unauthorized");
  }

  await electionData.deleteOne();
  return electionData;
};

export const getAllElectionResults = async () => {
  try {
    const elections = await Election.find().lean();
    if (!elections || elections.length === 0) {
      throw new Error("No elections found");
    }

    const allResults = {};

    for (const election of elections) {
      const results = await ElectionData.find({ election: election }).lean();
      if (!results || results.length === 0) {
        console.log(`No results found for election ${election}`);
        allResults[election] = [];
        continue;
      }

      const aggregatedResults = aggregateResults(results);
      allResults[election] = aggregatedResults;
    }

    return allResults;
  } catch (error) {
    console.error(`Error fetching all election results: ${error.message}`);
    throw new Error(`Error fetching all election results: ${error.message}`);
  }
};
// Service to get election results by id

export const uploadIncidentReportDataService = async (
  electionId,
  userId,
  data,
  files
) => {
  try{
    const { selectIncident, incidentNote } = data;

    const election = await Election.findById(electionId);
    if (!election) {
      throw new Error("Election not found");
    }

    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user has already uploaded incident data for this election
    const existingReport = await IncidentReport.findOne({
      election: electionId,
      user: userId,
    });

      if (existingReport) {
        return existingReport;
      }

    const incidentReport = new IncidentReport({
      election: electionId,
      user: userId,
      selectIncident,
      incidentNote,
      incidentPictures: files?.incidentPictures?.[0]?.path,
      incidentVideos: files?.incidentVideos?.[0]?.path,
    });

    const savedReport = await incidentReport.save();
    election.incidentReports.push(savedReport._id);
    await election.save();

    return savedReport;
  }catch(error){
   throw new Error(`Error saving election incident: ${error.message}`);
}
};

export const updateIncidentReportDataService = async (
  electionId,
  userId,
  data,
  files
) => {
  try {
    const {
      selectIncident,
      incidentNote,
    } = data;

    // Check if the election exists
    const electionExists = await Election.findById(electionId);
    if (!electionExists) {
      throw new Error("Election not found");
    }

    // Check if the incident report exists and belongs to the user
    const report = await IncidentReport.findOne({
      election: electionId,
      user: userId,
    });

    if (!report) {
      throw new Error("Incident report not found or unauthorized");
    }

    // Update report data
    report.selectIncident = selectIncident !== undefined ? selectIncident : report.selectIncident;
    report.incidentNote = incidentNote !== undefined ? incidentNote : report.incidentNote;

    // Handle file updates
    if (files && files.incidentPictures) {
      report.incidentPictures = files.incidentPictures.map((file) => file.path);
    }
    if (files && files.incidentVideos) {
      report.incidentVideos = files.incidentVideos.map((file) => file.path);
    }

    // Save the updated report
    return await report.save();
  } catch (error) {
    throw new Error(`Failed to update incident report data: ${error.message}`);
  }
};

// Helper function to aggregate results
// const aggregateResults = (results) => {
//   const aggregated = {};

//   results.forEach((result) => {
//     const {
//       state,
//       lga,
//       ward,
//       pollingUnit,
//       partiesVotes,
//       otherPartiesVotes,
//       voterIntimidation,
//       voteBuying,
//       rating,
//       resultSheets,
//       resultVideos,
//     } = result;

//     if (!aggregated[state]) {
//       aggregated[state] = { totalVotes: 0, localGovernments: {} };
//     }

//     if (!aggregated[state].localGovernments[lga]) {
//       aggregated[state].localGovernments[lga] = { totalVotes: 0, wards: {} };
//     }

//     if (!aggregated[state].localGovernments[lga].wards[ward]) {
//       aggregated[state].localGovernments[lga].wards[ward] = {
//         totalVotes: 0,
//         pollingUnits: {},
//       };
//     }

//     if (
//       !aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
//         pollingUnit
//       ]
//     ) {
//       aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
//         pollingUnit
//       ] = {
//         totalVotes: 0,
//         partiesVotes: {},
//         otherPartiesVotes: {},
//         voterIntimidation: 0,
//         voteBuying: 0,
//         goodRating: 0,
//         okayRating: 0,
//         badRating: 0,
//         resultSheets: 0,
//         resultVideos: 0,
//       };
//     }

//     const pollingUnitData =
//       aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
//         pollingUnit
//       ];

//     // Count parties votes
//     for (const { party, count } of partiesVotes) {
//       if (!pollingUnitData.partiesVotes[party]) {
//         pollingUnitData.partiesVotes[party] = 0;
//       }
//       pollingUnitData.partiesVotes[party] += count;
//       pollingUnitData.totalVotes += count;
//     }

//     // Count other parties votes
//     for (const { party, count } of otherPartiesVotes) {
//       if (!pollingUnitData.otherPartiesVotes[party]) {
//         pollingUnitData.otherPartiesVotes[party] = 0;
//       }
//       pollingUnitData.otherPartiesVotes[party] += count;
//       pollingUnitData.totalVotes += count;
//     }

//     // Count boolean fields
//     if (voterIntimidation === "yes") {
//       pollingUnitData.voterIntimidation++;
//     }
//     if (voteBuying === "yes") {
//       pollingUnitData.voteBuying++;
//     }

//     // Count rating fields
//     if (rating === "good") {
//       pollingUnitData.goodRating++;
//     } else if (rating === "okay") {
//       pollingUnitData.okayRating++;
//     } else if (rating === "bad") {
//       pollingUnitData.badRating++;
//     }

//     // Count result sheets and videos
//     pollingUnitData.resultSheets += resultSheets.length;
//     pollingUnitData.resultVideos += resultVideos.length;

//     aggregated[state].totalVotes += pollingUnitData.totalVotes;
//     aggregated[state].localGovernments[lga].totalVotes +=
//       pollingUnitData.totalVotes;
//     aggregated[state].localGovernments[lga].wards[ward].totalVotes +=
//       pollingUnitData.totalVotes;
//   });

//   return formatAggregatedResults(aggregated);
// };

// // Helper function to format aggregated results
// const formatAggregatedResults = (aggregated) => {
//   const formattedResults = [];

//   for (const state in aggregated) {
//     const stateData = {
//       state,
//       totalVotes: aggregated[state].totalVotes,
//       localGovernments: [],
//     };

//     for (const lga in aggregated[state].localGovernments) {
//       const lgaData = {
//         localGovernment: lga,
//         totalVotes: aggregated[state].localGovernments[lga].totalVotes,
//         wards: [],
//       };

//       for (const ward in aggregated[state].localGovernments[lga].wards) {
//         const wardData = {
//           ward,
//           totalVotes:
//             aggregated[state].localGovernments[lga].wards[ward].totalVotes,
//           pollingUnits: [],
//         };

//         for (const pollingUnit in aggregated[state].localGovernments[lga].wards[
//           ward
//         ].pollingUnits) {
//           const {
//             totalVotes,
//             partiesVotes,
//             otherPartiesVotes,
//             voterIntimidation,
//             voteBuying,
//             goodRating,
//             okayRating,
//             badRating,
//             resultSheets,
//             resultVideos,
//           } =
//             aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
//               pollingUnit
//             ];

//           const pollingUnitData = {
//             pollingUnit,
//             totalVotes,
//             partiesVotes: formatVoteCounts(partiesVotes),
//             otherPartiesVotes: formatVoteCounts(otherPartiesVotes),
//             voterIntimidation,
//             voteBuying,
//             goodRating,
//             okayRating,
//             badRating,
//             resultSheets,
//             resultVideos,
//           };

//           wardData.pollingUnits.push(pollingUnitData);
//         }

//         lgaData.wards.push(wardData);
//       }

//       stateData.localGovernments.push(lgaData);
//     }

//     formattedResults.push(stateData);
//   }

//   return formattedResults;
// };

// // Helper function to format vote counts
// const formatVoteCounts = (votes) => {
//   return Object.entries(votes).map(([party, count]) => ({ party, count }));
// };


// Helper function to aggregate results
const aggregateResults = (results) => {
  const aggregated = {};

  results.forEach((result) => {
    const {
      state,
      lga,
      ward,
      pollingUnit,
      partiesVotes,
      otherPartiesVotes,
      voterIntimidation,
      voteBuying,
      rating,
      resultSheets,
      resultVideos,
    } = result;

    if (!aggregated[state]) {
      aggregated[state] = { totalVotes: 0, localGovernments: {} };
    }

    if (!aggregated[state].localGovernments[lga]) {
      aggregated[state].localGovernments[lga] = { totalVotes: 0, wards: {} };
    }

    if (!aggregated[state].localGovernments[lga].wards[ward]) {
      aggregated[state].localGovernments[lga].wards[ward] = {
        totalVotes: 0,
        pollingUnits: {},
      };
    }

    if (
      !aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
        pollingUnit
      ]
    ) {
      aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
        pollingUnit
      ] = {
        totalVotes: 0,
        partiesVotes: {},
        otherPartiesVotes: {},
        voterIntimidation: 0,
        voteBuying: 0,
        goodRating: 0,
        okayRating: 0,
        badRating: 0,
        resultSheets: 0,
        resultVideos: 0,
      };
    }

    const pollingUnitData =
      aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
        pollingUnit
      ];

    // Count parties votes
    for (const { party, count } of partiesVotes) {
      if (!pollingUnitData.partiesVotes[party]) {
        pollingUnitData.partiesVotes[party] = 0;
      }
      pollingUnitData.partiesVotes[party] += count;
      pollingUnitData.totalVotes += count;
    }

    // Count other parties votes
    for (const { party, count } of otherPartiesVotes) {
      if (!pollingUnitData.otherPartiesVotes[party]) {
        pollingUnitData.otherPartiesVotes[party] = 0;
      }
      pollingUnitData.otherPartiesVotes[party] += count;
      pollingUnitData.totalVotes += count;
    }

    // Count boolean fields
    if (voterIntimidation === "yes") {
      pollingUnitData.voterIntimidation++;
    }
    if (voteBuying === "yes") {
      pollingUnitData.voteBuying++;
    }

    // Count rating fields
    if (rating === "good") {
      pollingUnitData.goodRating++;
    } else if (rating === "okay") {
      pollingUnitData.okayRating++;
    } else if (rating === "bad") {
      pollingUnitData.badRating++;
    }

    // Count result sheets and videos
    pollingUnitData.resultSheets += resultSheets.length;
    pollingUnitData.resultVideos += resultVideos.length;

    aggregated[state].totalVotes += pollingUnitData.totalVotes;
    aggregated[state].localGovernments[lga].totalVotes +=
      pollingUnitData.totalVotes;
    aggregated[state].localGovernments[lga].wards[ward].totalVotes +=
      pollingUnitData.totalVotes;
  });

  return formatAggregatedResults(aggregated);
};

// Helper function to format aggregated results
const formatAggregatedResults = (aggregated) => {
  const formattedResults = [];

  for (const state in aggregated) {
    const stateData = {
      state,
      totalVotes: aggregated[state].totalVotes,
      localGovernments: [],
    };

    for (const lga in aggregated[state].localGovernments) {
      const lgaData = {
        localGovernment: lga,
        totalVotes: aggregated[state].localGovernments[lga].totalVotes,
        wards: [],
      };

      for (const ward in aggregated[state].localGovernments[lga].wards) {
        const wardData = {
          ward,
          totalVotes:
            aggregated[state].localGovernments[lga].wards[ward].totalVotes,
          pollingUnits: [],
        };

        for (const pollingUnit in aggregated[state].localGovernments[lga].wards[
          ward
        ].pollingUnits) {
          const {
            totalVotes,
            partiesVotes,
            otherPartiesVotes,
            voterIntimidation,
            voteBuying,
            goodRating,
            okayRating,
            badRating,
            resultSheets,
            resultVideos,
          } =
            aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
              pollingUnit
            ];

          const pollingUnitData = {
            pollingUnit,
            totalVotes,
            partiesVotes: formatVoteCounts(partiesVotes),
            otherPartiesVotes: formatVoteCounts(otherPartiesVotes),
            voterIntimidation,
            voteBuying,
            goodRating,
            okayRating,
            badRating,
            resultSheets,
            resultVideos,
          };

          wardData.pollingUnits.push(pollingUnitData);
        }

        lgaData.wards.push(wardData);
      }

      stateData.localGovernments.push(lgaData);
    }

    formattedResults.push(stateData);
  }

  return formattedResults;
};

// Helper function to format vote counts
const formatVoteCounts = (votes) => {
  return Object.entries(votes).map(([party, count]) => ({ party, count }));
};


