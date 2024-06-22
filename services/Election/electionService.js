import Election from "../../models/Election/Election.js";
import ElectionData from "../../models/Election/ElectionData.js";
import PoliticalParty from "../../models/Election/PoliticalParty.js";
import CompletedUser from "../../models/CompletedUser.js";

export const createElection = async (type, year, startDate, endDate) => {
  const existingElection = await Election.findOne({ type, year });
  if (existingElection) {
    throw new Error("Election already exists for this type and year");
  }

  const election = new Election({ type, year, startDate, endDate });
  await election.save();
  return election;
};

export const addPoliticalParty = async (politicalPartyName) => {
    const newPartyName = politicalPartyName.toLowerCase();
  const existingParty = await PoliticalParty.findOne({ partyName: newPartyName });
  if (existingParty) {
    throw new Error("Political party already exists");
  }

  const newParty = new PoliticalParty({ partyName: newPartyName });
  await newParty.save();
  return newParty;
};


// export const uploadElectionDataService = async (req) => {
//   const { year, type } = req.params;
//   const {
//     partiesVotes,
//     otherPartiesVotes,
//     voterIntimidation,
//     voteBuying,
//     rating,
//   } = req.body;
//   const userId = req.user._id;

//   const election = await Election.findOne({ year, type });
//   if (!election) {
//     throw new Error("Election not found");
//   }

//   const user = await CompletedUser.findById(userId);
//   if (!user) {
//     throw new Error("User not found");
//   }

//   const electionData = new ElectionData({
//     election: election._id,
//     user: userId,
//     state: user.state,
//     lga: user.lga,
//     ward: user.ward,
//     pollingUnit: user.pollingUnit,
//     partiesVotes: JSON.parse(partiesVotes),
//     otherPartiesVotes: JSON.parse(otherPartiesVotes),
//     voterIntimidation,
//     voteBuying,
//     resultSheets: req.files?.resultSheets?.[0]?.path,
//     resultVideos: req.files?.resultVideos?.[0]?.path,
//     rating,
//   });

//   return await electionData.save();
// };

export const getUserElectionData = async (userId) => {
  return await ElectionData.find({ user: userId }).populate("election");
};

// export const updateUserElectionData = async (dataId, userId, data) => {
//   const electionData = await ElectionData.findOne({
//     _id: dataId,
//     user: userId,
//   });
//   if (!electionData) {
//     throw new Error("Election data not found or unauthorized");
//   }

//   Object.assign(electionData, data);
//   await electionData.save();
//   return electionData;
// };

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

// export const getAllElectionResults = async () => {
//   try {
//     const elections = await Election.find();
//     if (!elections || elections.length === 0) {
//       throw new Error("No elections found");
//     }

//     const allResults = {};

//     for (const election of elections) {
//       const results = await ElectionData.find({
//         election: election._id,
//       }).lean();
//       const aggregatedResults = aggregateResults(results);
//       allResults[`${election.type}-${election.year}`] = aggregatedResults;
//     }

//     return allResults;
//   } catch (error) {
//     throw new Error(`Error fetching all election results: ${error.message}`);
//   }
// };

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

// const formatVoteCounts = (votes) => {
//   return Object.entries(votes).map(([party, count]) => ({ party, count }));
// };

// export const getElectionResultsByTypeAndYear = async (type, year) => {
//   try {
//     const election = await Election.findOne({ type, year });
//     if (!election) {
//       throw new Error("Election not found");
//     }

//     const results = await ElectionData.find({ election: election._id }).lean();
//     const aggregatedResults = aggregateResults(results);

//     return {
//       election: {
//         type: election.type,
//         year: election.year,
//         startDate: election.startDate,
//         endDate: election.endDate,
//       },
//       results: aggregatedResults,
//     };
//   } catch (error) {
//     throw new Error(`Error fetching election results: ${error.message}`);
//   }
// };

// export const getPoliticalParties = async () => {
//   return await PoliticalParty.find();
// };


// Service to get all political parties
export const getPoliticalParties = async () => {
  const parties = await PoliticalParty.find();
  return parties;
};

// Service to upload election data
export const uploadElectionDataService = async (req) => {
  const { year, type } = req.params;
  const {
    partiesVotes,
    otherPartiesVotes,
    voterIntimidation,
    voteBuying,
    rating,
  } = req.body;
  const userId = req.user._id;

  const election = await Election.findOne({ year, type });
  if (!election) {
    throw new Error("Election not found");
  }

  const user = await CompletedUser.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const electionData = new ElectionData({
    election: election._id,
    user: userId,
    state: user.state,
    lga: user.lga,
    ward: user.ward,
    pollingUnit: user.pollingUnit,
    partiesVotes: JSON.parse(partiesVotes),
    otherPartiesVotes: JSON.parse(otherPartiesVotes),
    voterIntimidation,
    voteBuying,
    resultSheets: req.files?.resultSheets?.[0]?.path,
    resultVideos: req.files?.resultVideos?.[0]?.path,
    rating,
  });

  return await electionData.save();
};

// Service to update user's election data
export const updateUserElectionData = async (dataId, userId, data) => {
   const {
     partiesVotes,
     otherPartiesVotes,
     voterIntimidation,
     voteBuying,
     rating,
     resultSheets,
     resultVideos,
   } = data;

    const electionData = await ElectionData.findOne({
    _id: dataId,
    user: userId,
  });
  if (!electionData) {
    throw new Error("Election data not found or unauthorized");
  }

  electionData.partiesVotes = partiesVotes || electionData.partiesVotes;
  electionData.otherPartiesVotes =
    otherPartiesVotes || electionData.otherPartiesVotes;
  electionData.voterIntimidation =
    voterIntimidation || electionData.voterIntimidation;
  electionData.voteBuying = voteBuying || electionData.voteBuying;
  electionData.rating = rating || electionData.rating;
  electionData.resultSheets = resultSheets || electionData.resultSheets;
  electionData.resultVideos = resultVideos || electionData.resultVideos;

  // Save the updated election data
  await electionData.save();

  return electionData.toObject();
};

// Service to get all election results
export const getAllElectionResults = async () => {
  try {
    const elections = await Election.find();
    if (!elections || elections.length === 0) {
      throw new Error("No elections found");
    }

    const allResults = {};

    for (const election of elections) {
      const results = await ElectionData.find({
        election: election._id,
      }).lean();
      const aggregatedResults = aggregateResults(results);
      allResults[`${election.type}-${election.year}`] = aggregatedResults;
    }

    return allResults;
  } catch (error) {
    throw new Error(`Error fetching all election results: ${error.message}`);
  }
};

// Service to get election results by type and year
export const getElectionResultsByTypeAndYear = async (type, year) => {
  try {
    const election = await Election.findOne({ type, year });
    if (!election) {
      throw new Error("Election not found");
    }

    const results = await ElectionData.find({ election: election._id }).lean();
    const aggregatedResults = aggregateResults(results);

    return {
      election: {
        type: election.type,
        year: election.year,
        startDate: election.startDate,
        endDate: election.endDate,
      },
      results: aggregatedResults,
    };
  } catch (error) {
    throw new Error(`Error fetching election results: ${error.message}`);
  }
};

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