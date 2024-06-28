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
    const error = new Error(
      "Election already exists for this type and date range"
    );
    error.statusCode = 400;
    throw error;
  }
  const election = new Election({ electionType, startDate, endDate });
  
 const savedElection = await election.save();

 // Remove the fields from the saved election object
 const { results, incidentReports, politicalParties, ...electionData } =
   savedElection.toObject();

 return electionData;
};

export const updateElectionService = async (electionId, data) => {
  const election = await Election.findByIdAndUpdate(electionId, data, {
    new: true,
  }).lean();
  if (!election) {
    const error = new Error("Election not found");
    error.statusCode = 404;
    throw error;
  }
  const {
    politicalParties,
    resultsCount,
    incidentReports,
    results,
    ...electionData
  } = election;
  return electionData;
};

export const getAllElectionsService = async () => {
  const elections = await Election.find().select(
    "-results -incidentReports -politicalParties"
  );
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

  if (result || incidentReport) {
    return { election, result, incidentReport };
  }
};

export const getElectionById = async (electionId, userId) => {
  try {
    // Fetch the election data by ID
    const election = await Election.findById(electionId).lean();
    if (!election) {
      throw new Error("Election not found");
    }

    // Fetch the election result data for the specific user and election
    const result = await ElectionData.findOne({
      election: electionId,
      user: userId,
    }).lean();

    // Fetch the incident report data for the specific user and election
    const incidentReport = await IncidentReport.findOne({
      election: electionId,
      user: userId,
    }).lean();

    // Fetch detailed data for all results
    const detailedResults = await ElectionData.find({
      _id: { $in: election.results },
    }).lean();

    // Fetch detailed data for all incident reports
    const detailedIncidentReports = await IncidentReport.find({
      _id: { $in: election.incidentReports },
    }).lean();

    // Create the election data object including political parties, results, and incident reports
    const electionData = {
      ...election,
      politicalParties: politicalParties.map((party) => ({
        name: party.name,
        code: party.code,
      })),
      results: detailedResults, // Include detailed data for all results
      incidentReports: detailedIncidentReports, // Include detailed data for all incident reports
    };

    // Remove the resultsCount field from the election data object
    delete electionData.resultsCount;

    return { election: electionData };
  } catch (error) {
    throw new Error(`Error fetching election data: ${error.message}`);
  }
};

export const uploadResultDataService = async (
  electionId,
  userId,
  data,
  files
) => {
  try {
    const {
      partiesVotes,
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

    const formatFileDetails = (file) => ({
      location: file.path,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    });

    // Create new result data
    const electionData = new ElectionData({
      election: electionId,
      user: userId,
      state: user.state,
      lga: user.lga,
      ward: user.ward,
      pollingUnit: user.pollingUnit,
      partiesVotes: JSON.parse(partiesVotes),
      voterIntimidation,
      voteBuying,
      resultPictures: files.resultPictures
        ? files.resultPictures.map(formatFileDetails)
        : [],
      resultVideos:
        files.resultVideos && files.resultVideos.length
          ? formatFileDetails(files.resultVideos[0])
          : null,
      voteRating,
    });

    const savedResultData = await electionData.save();
    election.results.push(savedResultData);
    election.resultsCount += 1;
   await election.save();

   return savedResultData;

  } catch (error) {
    throw new Error(`Error saving election data: ${error.message}`);
  }
};

export const updateResultDataService = async (
  electionId,
  userId,
  data,
  files
) => {
  try {
    const { partiesVotes, voterIntimidation, voteBuying, voteRating } = data;

    // Check if the election exists
    const electionExists = await Election.findById(electionId);
    if (!electionExists) {
      throw new Error("Election not found");
    }

    // Check if the user exists
    const userExists = await CompletedUser.findById(userId);
    if (!userExists) {
      throw new Error("User not found or unauthorized");
    }

    // Find the result data
    const result = await ElectionData.findOne({
      election: electionId,
      user: userId,
    });

    if (!result) {
      throw new Error("Result data not found or unauthorized");
    }

    // Helper function to format file details
    const formatFileDetails = (file) => ({
      location: file.path,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    });

    // Update result data
    result.partiesVotes = partiesVotes
      ? JSON.parse(partiesVotes)
      : result.partiesVotes;
    result.voterIntimidation =
      voterIntimidation !== undefined
        ? voterIntimidation
        : result.voterIntimidation;
    result.voteBuying =
      voteBuying !== undefined ? voteBuying : result.voteBuying;
    result.voteRating =
      voteRating !== undefined ? voteRating : result.voteRating;

    // Handle file updates
    if (files.resultPictures && files.resultPictures.length) {
      result.resultPictures = files.resultPictures.map(formatFileDetails);
    }
    if (files.resultVideos && files.resultVideos.length) {
      result.resultVideos = formatFileDetails(files.resultVideos[0]);
    }

    // Save the updated result
    const updatedResult = await result.save();
    return updatedResult;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error(`Failed to update result data: ${error.message}`);
  }
};

export const deleteElectionResultDataService = async (electionId) => {
  try {
    // Find and delete the result data
    const result = await ElectionData.findOneAndDelete({
      election: electionId,
    });

    if (!result) {
      throw new Error("Result data not found or unauthorized");
    }

    // Update the election to remove the reference to the deleted result
    await Election.findByIdAndUpdate(electionId, {
      $pull: { results: result._id },
      $inc: { resultsCount: -1 },
    });

    return { message: "Result data deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete result data: ${error.message}`);
  }
};

export const getUserElectionData = async (userId) => {
  return await ElectionData.find({ user: userId }).populate("election");
};

export const getAllElectionResults = async () => {
  try {
    const elections = await Election.find().lean();
    if (!elections || elections.length === 0) {
      throw new Error("No elections found");
    }

    const allResults = {};

    for (const election of elections) {
      const results = await ElectionData.find({
        election: election._id,
      }).lean();
      const incidents = await IncidentReport.find({
        election: election._id,
      }).lean();

      if (!results || results.length === 0) {
        // console.log(`No results found for election ${election._id}`);
        allResults[election._id] = {
          electionDetails: {
            electionType: election.electionType,
            startDate: election.startDate,
            endDate: election.endDate,
          },
          results: [],
          incidents: aggregateIncidents(incidents) || [],
        };
        continue;
      }

      const aggregatedResults = aggregateResults(results);
      allResults[election._id] = {
        electionDetails: {
          electionType: election.electionType,
          startDate: election.startDate,
          endDate: election.endDate,
          resultsCount: election.resultsCount,
        },
        results: aggregatedResults,
        incidents: aggregateIncidents(incidents) || [],
      };
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
  try {
    const { selectIncident, incidentNote, electionRating } = data;

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

      const formatFileDetails = (file) => ({
        location: file.path,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
      });


    const incidentReport = new IncidentReport({
      election: electionId,
      user: userId,
      state: user.state,
      lga: user.lga,
      ward: user.ward,
      pollingUnit: user.pollingUnit,
      selectIncident,
      incidentNote,
      electionRating,
      incidentPictures: files.incidentPictures
        ? files.incidentPictures.map(formatFileDetails)
        : [],
      incidentVideos:
        files.incidentVideos && files.incidentVideos.length
          ? formatFileDetails(files.incidentVideos[0])
          : null,
    });

    const savedReport = await incidentReport.save();
    election.incidentReports.push(savedReport);
    await election.save();

    return savedReport;
  } catch (error) {
    console.error("Error uploading incident report data", error); // Improved logging
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
    const { selectIncident, incidentNote, electionRating } = data;

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

    // Helper function to format file details
    const formatFileDetails = (file) => ({
      location: file.path,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    });

    // Update report data
    report.selectIncident =
      selectIncident !== undefined ? selectIncident : report.selectIncident;
    report.incidentNote =
      incidentNote !== undefined ? incidentNote : report.incidentNote;
    report.electionRating =
      electionRating !== undefined ? electionRating : report.electionRating;

    // Handle file updates
    report.incidentPictures = files.incidentPictures
      ? files.incidentPictures.map(formatFileDetails)
      : report.incidentPictures;
    report.incidentVideos =
      files.incidentVideos && files.incidentVideos.length
        ? formatFileDetails(files.incidentVideos[0])
        : report.incidentVideos;

    // Save the updated report
    return await report.save();
  } catch (error) {
    throw new Error(`Failed to update incident report data: ${error.message}`);
  }
};

export const deleteIncidentReportDataService = async (electionId) => {
  try {
    // Find and delete the incident report
    const incidentReport = await IncidentReport.findOneAndDelete({
      election: electionId,
    });

    if (!incidentReport) {
      throw new Error("Incident report not found or unauthorized");
    }

    // Update the election to remove the reference to the deleted incident report
    await Election.findByIdAndUpdate(electionId, {
      $pull: { incidentReports: incidentReport._id },
    });

    return { message: "Incident report deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete incident report data: ${error.message}`);
  }
};

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
      voteRating,
      resultPictures,
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
        resultPictures: 0,
        resultVideos: 0,
      };
    }

    const pollingUnitData =
      aggregated[state].localGovernments[lga].wards[ward].pollingUnits[
        pollingUnit
      ];

    // Count parties votes
    if (partiesVotes) {
      for (const { party, count } of partiesVotes) {
        if (!pollingUnitData.partiesVotes[party]) {
          pollingUnitData.partiesVotes[party] = 0;
        }
        pollingUnitData.partiesVotes[party] += count;
        pollingUnitData.totalVotes += count;
      }
    }

    // Count other parties votes
    if (otherPartiesVotes) {
      for (const { party, count } of otherPartiesVotes) {
        if (!pollingUnitData.otherPartiesVotes[party]) {
          pollingUnitData.otherPartiesVotes[party] = 0;
        }
        pollingUnitData.otherPartiesVotes[party] += count;
        pollingUnitData.totalVotes += count;
      }
    }

    // Count boolean fields
    if (voterIntimidation === "yes") {
      pollingUnitData.voterIntimidation++;
    }
    if (voteBuying === "yes") {
      pollingUnitData.voteBuying++;
    }

    // Count rating fields
    if (voteRating === "good") {
      pollingUnitData.goodRating++;
    } else if (voteRating === "okay") {
      pollingUnitData.okayRating++;
    } else if (voteRating === "bad") {
      pollingUnitData.badRating++;
    }

    // Count result pictures and videos
    pollingUnitData.resultPictures += (resultPictures || []).length;
    pollingUnitData.resultVideos += (resultVideos || []).length;

    aggregated[state].totalVotes += pollingUnitData.totalVotes;
    aggregated[state].localGovernments[lga].totalVotes +=
      pollingUnitData.totalVotes;
    aggregated[state].localGovernments[lga].wards[ward].totalVotes +=
      pollingUnitData.totalVotes;
  });

  return formatAggregatedResults(aggregated);
};

const aggregateIncidents = (incidents) => {
  const aggregated = {};

  incidents.forEach((incident) => {
    const { state, lga, ward, selectIncident } = incident;

    if (!aggregated[state]) {
      aggregated[state] = { totalIncidents: 0, localGovernments: {} };
    }

    if (!aggregated[state].localGovernments[lga]) {
      aggregated[state].localGovernments[lga] = {
        totalIncidents: 0,
        wards: {},
      };
    }

    if (!aggregated[state].localGovernments[lga].wards[ward]) {
      aggregated[state].localGovernments[lga].wards[ward] = {
        totalIncidents: 0,
        incidentTypes: {},
      };
    }

    const wardData = aggregated[state].localGovernments[lga].wards[ward];

    if (!wardData.incidentTypes[selectIncident]) {
      wardData.incidentTypes[selectIncident] = 0;
    }
    wardData.incidentTypes[selectIncident]++;

    aggregated[state].totalIncidents++;
    aggregated[state].localGovernments[lga].totalIncidents++;
    wardData.totalIncidents++;
  });

  return formatAggregatedIncidents(aggregated);
};

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
            resultPictures,
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
            resultPictures,
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

const formatAggregatedIncidents = (aggregated) => {
  const formattedIncidents = [];

  for (const state in aggregated) {
    const stateData = {
      state,
      totalIncidents: aggregated[state].totalIncidents,
      localGovernments: [],
    };

    for (const lga in aggregated[state].localGovernments) {
      const lgaData = {
        localGovernment: lga,
        totalIncidents: aggregated[state].localGovernments[lga].totalIncidents,
        wards: [],
      };

      for (const ward in aggregated[state].localGovernments[lga].wards) {
        const wardData = {
          ward,
          totalIncidents:
            aggregated[state].localGovernments[lga].wards[ward].totalIncidents,
          incidentTypes: formatIncidentCounts(
            aggregated[state].localGovernments[lga].wards[ward].incidentTypes
          ),
        };

        lgaData.wards.push(wardData);
      }

      stateData.localGovernments.push(lgaData);
    }

    formattedIncidents.push(stateData);
  }

  return formattedIncidents;
};

const formatVoteCounts = (votes) => {
  return Object.entries(votes).map(([party, count]) => ({ party, count }));
};

const formatIncidentCounts = (incidents) => {
  return Object.entries(incidents).map(([type, count]) => ({ type, count }));
};
