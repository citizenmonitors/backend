import Election from "../../models/Election/Election.js";
import ElectionData from "../../models/Election/ElectionData.js";
import CompletedUser from "../../models/CompletedUser.js";
import { politicalParties } from "../../models/Election/PoliticalParty.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import File from "../../models/file.js";
import path from "path";
import mongoose from "mongoose";

export const createElectionService = async (data) => {
  const { electionType, electionName, startDate, endDate } = data;

  const existingElection = await Election.findOne({
    electionType,
    electionName,
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

  try{
  const election = new Election({ electionType, electionName, startDate, endDate });

  const savedElection = await election.save();

  // Remove the fields from the saved election object
  const { results, resultsCount, incidentReports, politicalParties, ...electionData } =
    savedElection.toObject();

  return electionData;
  }catch(error){
    const serviceError = new Error("Failed to create a new election");
    serviceError.statusCode = 500;
    serviceError.details = error.message;
    throw serviceError;
  }
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

export const getAllElectionsService = async (userId) => {
  const elections = await Election.find()
    .populate({ path: "results", select: "election user" })
    .populate({ path: "incidentReports", select: "election user" });

  console.log(userId.toString());

  return elections.map((election) => {
    election.results = election.results
      .filter((result) => result.user.toString() === userId.toString())
      .map((result) => result._id);
    election.incidentReports = election.incidentReports
      .filter((report) => report.user.toString() === userId.toString())
      .map((report) => report._id);
    return election;
  });
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
    console.log("election and user", electionId, userId);

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
    // const detailedResults = await ElectionData.find({
    //   _id: { $in: election.results },
    // }).lean();

    // // Fetch detailed data for all incident reports
    // const detailedIncidentReports = await IncidentReport.find({
    //   _id: { $in: election.incidentReports },
    // }).lean();

    // Create the election data object including political parties, results, and incident reports
    const electionData = {
      ...election,
      politicalParties: politicalParties.map((party) => ({
        name: party.name,
        code: party.code,
      })),
      results: result ? [result] : [], // Include detailed data for all results
      incidentReports: incidentReport ? [incidentReport] : [], // Include detailed data for all incident reports
    };

    // Remove the resultsCount field from the election data object
    delete electionData.resultsCount;

    return { election: electionData };
  } catch (error) {
    throw new Error(`Error fetching election data: ${error.message}`);
  }
};

// export const getLiveElectionById = async (electionId) => {
//   try {
//     // Fetch the election data by ID
//     const election = await Election.findById(electionId).lean();
//     if (!election) {
//       throw new Error("Election not found");
//     }
//     console.log("election", electionId);

//     // Fetch the election result data for the specific election
//     const results = await ElectionData.find({ election: electionId }).lean();

//     // Create the election data
//     const electionData = {
//       electionDetails: {
//         electiontype: election.electionType,
//         startdate: election.startDate,
//         enddate: election.endDate,
//       },
//       results: results.map((result) => ({
//         state: result.state,
//         lga: result.lga,
//         ward: result.ward,
//         pollingUnit: result.pollingUnit,
//         partiesVotes: result.partiesVotes,
//         voteRating: result.voteRating,
//         voterIntimidation: result.voterIntimidation,
//         voteBuying: result.voteBuying,
//       })),
//     };

//     return { election: electionData };
//   } catch (error) {
//     throw new Error(`Error fetching election data: ${error.message}`);
//   }
// };

export const getLiveElectionById = async (electionId) => {
  try {
    // Fetch the election data by ID
    const election = await Election.findById(electionId).lean();
    if (!election) {
      throw new Error("Election not found");
    }
    console.log("election", electionId);

    // Fetch the election result data for the specific election
    const results = await ElectionData.find({ election: electionId }).lean();

    // Fetch the incident report data for the specific election
    const incidentReports = await IncidentReport.find({
      election: electionId,
    }).lean();

    // Create the election data object including both results and incident reports
    const electionData = {
      electionDetails: {
        electiontype: election.electionType,
        startdate: election.startDate,
        enddate: election.endDate,
      },
      results: results.map((result) => ({
        state: result.state,
        lga: result.lga,
        ward: result.ward,
        pollingUnit: result.pollingUnit,
        partiesVotes: result.partiesVotes,
        voteRating: result.voteRating,
        voterIntimidation: result.voterIntimidation,
        voteBuying: result.voteBuying,
      })),
      incidentReports: incidentReports.map((report) => ({
        state: report.state,
        lga: report.lga,
        ward: report.ward,
        pollingUnit: report.pollingUnit,
        selectIncident: report.selectIncident,
        incidentNote: report.incidentNote,
        electionRating: report.electionRating,
      })),
    };

    return { election: electionData };
  } catch (error) {
    throw new Error(`Error fetching election data: ${error.message}`);
  }
};

// export const uploadResultDataService = async (
//   electionId,
//   userId,
//   data,
//   files
// ) => {
//   try {
//     const {
//       partiesVotes,
//       voterIntimidation,
//       voteBuying,
//       voteRating,
//       timeBegan,
//       accreditedVoters,
//     } = data;

//     const election = await Election.findById(electionId);
//     if (!election) {
//       throw new Error("Election not found");
//     }

//     const user = await CompletedUser.findById(userId);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     const existingResult = await ElectionData.findOne({
//       election: electionId,
//       user: userId,
//     });

//     if (existingResult) {
//       return existingResult;
//     }

//     const resultPicture = await File.create({
//       location: files.resultPicture[0].path,
//       name: files.resultPicture[0].originalname,
//       type: files.resultPicture[0].mimetype,
//       size: files.resultPicture[0].size,
//     });

//     const resultVideo = await File.create({
//       location: files.resultVideo[0].path,
//       name: files.resultVideo[0].originalname,
//       type: files.resultVideo[0].mimetype,
//       size: files.resultVideo[0].size,
//     });

//     const electionData = new ElectionData({
//       election: electionId,
//       user: userId,
//       role: user.role,
//       state: user.state,
//       lga: user.lga,
//       ward: user.ward,
//       pollingUnit: user.pollingUnit,
//       partiesVotes,
//       voterIntimidation,
//       voteBuying,
//       resultPicture,
//       resultVideo,
//       voteRating,
//       timeBegan,
//       accreditedVoters,
//     });

//     const savedResultData = await electionData.save();
//     election.results.push(savedResultData);
//     election.resultsCount += 1;
//     await election.save();

//     return savedResultData;
//   } catch (error) {
//     throw new Error(`Error saving election data: ${error.message}`);
//   }
// };


export const uploadResultDataService = async (
  electionId,
  userId,
  data,
  files
) => {
  try {
    let {
      partiesVotes,
      voterIntimidation,
      voteBuying,
      voteRating,
      timeBegan,
      accreditedVoters,
      rejectedVoters, // Include rejectedVoters in data
    } = data;

    // Ensure that partiesVotes is properly parsed as JSON
    if (typeof partiesVotes === "string") {
      try {
        partiesVotes = JSON.parse(partiesVotes);
      } catch (error) {
        throw new Error(
          "Invalid format for partiesVotes. It should be a JSON array."
        );
      }
    }

    // Convert accreditedVoters and rejectedVoters to numbers
    accreditedVoters = Number(accreditedVoters);
    rejectedVoters = Number(rejectedVoters);

    if (isNaN(accreditedVoters) || isNaN(rejectedVoters)) {
      throw new Error(
        "accreditedVoters and rejectedVoters must be valid numbers."
      );
    }

    // Find the election by its ID
    const election = await Election.findById(electionId);
    if (!election) {
      throw new Error("Election not found");
    }

    // Find the user by ID
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user has already uploaded a result for this election
    const existingResult = await ElectionData.findOne({
      election: electionId,
      user: userId,
    });

    if (existingResult) {
      return existingResult; // If result already exists, return it
    }

    // Convert partiesVotes.count to numbers
    const totalVotes = partiesVotes.reduce((sum, partyVote) => {
      return sum + Number(partyVote.count);
    }, 0);

    // Validate that the sum of partiesVotes and rejectedVoters equals accreditedVoters
    if (totalVotes + rejectedVoters !== accreditedVoters) {
      throw new Error(
        "The total of partiesVotes plus rejectedVoters must equal accreditedVoters"
      );
    }

    // Initialize result picture and video
    let resultPicture = null;
    let resultVideo = null;

    // Handle the picture file upload (if provided)
    if (files.resultPicture && files.resultPicture.length > 0) {
      resultPicture = await File.create({
        location: files.resultPicture[0].path,
        name: files.resultPicture[0].originalname,
        type: files.resultPicture[0].mimetype,
        size: files.resultPicture[0].size,
      });
    }

    // Handle the video file upload (if provided)
    if (files.resultVideo && files.resultVideo.length > 0) {
      resultVideo = await File.create({
        location: files.resultVideo[0].path,
        name: files.resultVideo[0].originalname,
        type: files.resultVideo[0].mimetype,
        size: files.resultVideo[0].size,
      });
    }

    // Determine if the result should include "isApproved"
    let isApproved = null;
    if (user.role === "observer" && user.isObserverInPollingUnit) {
      isApproved = false; // Mark as false if observer in the polling unit
    }

    // Create the election data document
    const electionData = new ElectionData({
      election: electionId,
      user: userId,
      userRole: user.role,
      state: user.state,
      lga: user.lga,
      ward: user.ward,
      pollingUnit: user.pollingUnit,
      partiesVotes,
      voterIntimidation,
      voteBuying,
      resultPicture,
      resultVideo,
      voteRating,
      timeBegan,
      accreditedVoters,
      rejectedVoters, // Include rejectedVoters field
      ...(isApproved !== null && { isApproved }), // Conditionally include isApproved
    });

    // Save the election result data
    const savedResultData = await electionData.save();

    // Update the election document with the new result
    election.results.push(savedResultData);
    election.resultsCount += 1; // Increment the results count
    await election.save();

    // Convert to a plain object and remove isApproved if not applicable
    const resultData = savedResultData.toObject();
    if (isApproved === null) {
      delete resultData.isApproved; // Remove isApproved if it's not set
    }

    // Return the saved result data
    return resultData;
  } catch (error) {
    console.error("Error saving election data:", error);
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
    let {
      partiesVotes,
      voterIntimidation,
      voteBuying,
      voteRating,
      timeBegan,
      accreditedVoters,
      rejectedVoters,
    } = data;

    // Ensure partiesVotes is properly parsed if sent as a string
    if (typeof partiesVotes === "string") {
      try {
        partiesVotes = JSON.parse(partiesVotes);
      } catch (error) {
        throw new Error(
          "Invalid format for partiesVotes. It should be a JSON array."
        );
      }
    }

    // Convert accreditedVoters and rejectedVoters to numbers if provided
    accreditedVoters =
      accreditedVoters !== undefined ? Number(accreditedVoters) : undefined;
    rejectedVoters =
      rejectedVoters !== undefined ? Number(rejectedVoters) : undefined;

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

    // Validate that the sum of partiesVotes and rejectedVoters equals accreditedVoters
    if (partiesVotes || rejectedVoters || accreditedVoters) {
      const totalVotes = partiesVotes
        ? partiesVotes.reduce(
            (sum, partyVote) => sum + Number(partyVote.count),
            0
          )
        : result.partiesVotes.reduce(
            (sum, partyVote) => sum + Number(partyVote.count),
            0
          );

      const validatedRejectedVoters =
        rejectedVoters !== undefined ? rejectedVoters : result.rejectedVoters;
      const validatedAccreditedVoters =
        accreditedVoters !== undefined
          ? accreditedVoters
          : result.accreditedVoters;

      if (totalVotes + validatedRejectedVoters !== validatedAccreditedVoters) {
        throw new Error(
          "The total of partiesVotes plus rejectedVoters must equal accreditedVoters"
        );
      }
    }

    // Update fields only if they are provided
    result.partiesVotes =
      partiesVotes !== undefined ? partiesVotes : result.partiesVotes;
    result.voterIntimidation =
      voterIntimidation !== undefined
        ? voterIntimidation
        : result.voterIntimidation;
    result.voteBuying =
      voteBuying !== undefined ? voteBuying : result.voteBuying;
    result.voteRating =
      voteRating !== undefined ? voteRating : result.voteRating;
    result.timeBegan = timeBegan !== undefined ? timeBegan : result.timeBegan;
    result.accreditedVoters =
      accreditedVoters !== undefined
        ? accreditedVoters
        : result.accreditedVoters;
    result.rejectedVoters =
      rejectedVoters !== undefined ? rejectedVoters : result.rejectedVoters;

    // Concurrently create resultPicture and resultVideo if provided
    const filePromises = [];

    if (files.resultPicture && files.resultPicture.length > 0) {
      filePromises.push(
        File.create({
          location: files.resultPicture[0].path,
          name: files.resultPicture[0].originalname,
          type: files.resultPicture[0].mimetype,
          size: files.resultPicture[0].size,
        }).then((file) => {
          result.resultPicture = file;
        })
      );
    }

    if (files.resultVideo && files.resultVideo.length > 0) {
      filePromises.push(
        File.create({
          location: files.resultVideo[0].path,
          name: files.resultVideo[0].originalname,
          type: files.resultVideo[0].mimetype,
          size: files.resultVideo[0].size,
        }).then((file) => {
          result.resultVideo = file;
        })
      );
    }

    // Wait for all file operations to complete
    await Promise.all(filePromises);

    // Save the updated result data
    const updatedResult = await result.save();

    return updatedResult;
  } catch (error) {
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
            electionName: election.electionName,
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
          electionName: election.electionName,
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

export const uploadIncidentReportDataService = async (
  electionId,
  userId,
  data,
  files
) => {
  try {
    const { selectIncident, incidentNote, electionRating } = data;

    // Check election existence
    const election = await Election.findById(electionId);
    if (!election) {
      throw new Error("Election not found");
    }

    // Check user existence
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if incident report exists
    const existingReport = await IncidentReport.findOne({
      election: electionId,
      user: userId,
    });
    if (existingReport) return existingReport;

    // Validate file types
    const validateFile = (file, allowedExtensions) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error(
          `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`
        );
      }
      return {
        location: file.path,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
      };
    };

    // Process and validate incident videos
    const incidentVideos = files?.incidentVideos?.length
      ? files.incidentVideos.map((file) =>
          validateFile(file, [".mp4", ".avi", ".mov", ".webm", ".wmv"])
        )
      : [];

    // Process and validate incident pictures
    const incidentPictures = files?.incidentPictures?.length
      ? files.incidentPictures.map((file) =>
          validateFile(file, [".jpg", ".jpeg", ".png", ".svg"])
        )
      : [];

    // Insert files if any are provided
    const insertedPictures = incidentPictures.length
      ? await File.insertMany(incidentPictures)
      : [];
    const insertedVideos = incidentVideos.length
      ? await File.insertMany(incidentVideos)
      : [];

    // Create incident report
    const incidentReport = new IncidentReport({
      election: electionId,
      user: userId,
      userRole: user.role,
      state: user.state,
      lga: user.lga,
      ward: user.ward,
      pollingUnit: user.pollingUnit,
      selectIncident,
      incidentNote,
      electionRating,
      incidentPictures: insertedPictures,
      incidentVideos: insertedVideos,
    });

    const savedReport = await incidentReport.save();

    // Link the incident report to the election
    election.incidentReports.push(savedReport);
    await election.save();

    return savedReport;
  } catch (error) {
    console.error("Error uploading incident report data:", error);
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
      electionRating,
      previousIncidentPictures = [], 
      previousIncidentVideos = [],
    } = data;

    // Check if the election exists
    const electionExists = await Election.findById(electionId);
    if (!electionExists) throw new Error("Election not found");

    // Check if the incident report exists and belongs to the user
    const report = await IncidentReport.findOne({
      election: electionId,
      user: userId,
    });
    if (!report) throw new Error("Incident report not found or unauthorized");

    // Helper function to format file details
    const formatFileDetails = (file) => ({
      location: file.path,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    });

    // Update report data fields if provided
    report.selectIncident =
      selectIncident !== undefined ? selectIncident : report.selectIncident;
    report.incidentNote =
      incidentNote !== undefined ? incidentNote : report.incidentNote;
    report.electionRating =
      electionRating !== undefined ? electionRating : report.electionRating;

    // Handle video files
    const previousIncidentVideoFiles = previousIncidentVideos.length
      ? await File.find({ _id: { $in: previousIncidentVideos } })
      : [];
    const newIncidentVideoFiles = files?.incidentVideos?.length
      ? files.incidentVideos.map((file) => formatFileDetails(file))
      : [];
    const newVideos = newIncidentVideoFiles.length
      ? await File.insertMany(newIncidentVideoFiles)
      : [];

    // Merge old and new videos
    report.incidentVideos = [...previousIncidentVideoFiles, ...newVideos];

    // Handle picture files
    const previousIncidentPictureFiles = previousIncidentPictures.length
      ? await File.find({ _id: { $in: previousIncidentPictures } })
      : [];
    const newIncidentPictureFiles = files?.incidentPictures?.length
      ? files.incidentPictures.map((file) => formatFileDetails(file))
      : [];
    const newPictures = newIncidentPictureFiles.length
      ? await File.insertMany(newIncidentPictureFiles)
      : [];

    // Merge old and new pictures
    report.incidentPictures = [...previousIncidentPictureFiles, ...newPictures];

    // Save the updated report
    return await report.save();
  } catch (error) {
    console.error("Error updating incident report data", error);
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

    await Election.findByIdAndUpdate(electionId, {
      $pull: { incidentReports: incidentReport._id },
    });

    return { message: "Incident report deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete incident report data: ${error.message}`);
  }
};


export const getUserElectionResultsAndReports = async (userId) => {
  try {
    // Confirm that the user exists
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch election results by user
    const electionResults = await ElectionData.find({ user: userId })
      .populate(
        "election",
        "electionType electionName startDate endDate createdAt updatedAt"
      )
      .lean();

    // Fetch incident reports by user
    const incidentReports = await IncidentReport.find({ user: userId })
      .populate(
        "election",
        "electionType electionName startDate endDate createdAt updatedAt"
      )
      .lean();

    // Return the results in the required format
    return { data: { electionResults, incidentReports } };
  } catch (error) {
    console.error(
      `Error fetching election results and incident reports: ${error.message}`
    );
    throw new Error(
      `Failed to fetch election results and incident reports: ${error.message}`
    );
  }
};


// export const getResultsAndPerformAction = async (userId, actionData) => {
//   // Fetch user to get polling unit
//   const user = await CompletedUser.findById(userId).lean();
//   if (!user || !user.pollingUnit) {
//     throw new Error("User not found or polling unit is missing");
//   }

//   const pollingUnit = user.pollingUnit;

//   // Fetch all observers in the same polling unit
//   const observers = await CompletedUser.find({
//     pollingUnit,
//     role: "observer",
//     isObserverInPollingUnit: true,
//   }).lean();
//   const observerIds = observers.map((observer) => observer._id);

//   // Fetch election results uploaded by observers in the polling unit
//   const electionResults = await ElectionData.find({
//     pollingUnit,
//     user: { $in: observerIds },
//   })
//     .populate({
//       path: "election",
//       select: "electionType startDate endDate", // Include election type and date
//     })
//     .lean();
    

//   // Fetch incident reports uploaded by observers in the polling unit
//   const incidentReports = await IncidentReport.find({
//     pollingUnit,
//     user: { $in: observerIds },
//   })
//     .populate({
//       path: "election",
//       select: "electionType startDate endDate", // Include election type and date
//     })
//     .lean();

//   // If actionData is provided, perform the action
//   if (
//     actionData &&
//     actionData.electionId &&
//     actionData.action &&
//     actionData.dataType
//   ) {
//     let dataModel;


//     // Determine the model based on the data type
//     if (actionData.dataType === "election") {
//       dataModel = ElectionData;
//     } else if (actionData.dataType === "incident") {
//       dataModel = IncidentReport;
//     } else {
//       throw new Error(
//         "Invalid data type. It must be 'election' or 'incident'."
//       );
//     }

//     // Find the election result or incident report by electionId
//     const data = await dataModel.findById(actionData.electionId);
//     if (!data) {
//       throw new Error(
//         `${
//           actionData.dataType === "election"
//             ? "Election result"
//             : "Incident report"
//         } not found`
//       );
//     }

//     // Handle user action
//     const existingAction = data.actions.find(
//       (a) => a.userId.toString() === userId.toString()
//     );

//     if (existingAction) {
//       // Update existing action
//       existingAction.action = actionData.action;
//       data.agreed = actionData.action === "agree";
//       data.disagreed = actionData.action === "disagree";
//     } else {
//       // Add new action to the actions array
//       data.actions.push({
//         userId,
//         action: actionData.action,
//       });
//       data.agreed = actionData.action === "agree";
//       data.disagreed = actionData.action === "disagree";
//     }

//     // Save the updated election result or incident report
//     await data.save();
//   }

//   // Fetch the updated state after action and prepare data
//   const updatedElectionResults = await ElectionData.find({
//     pollingUnit,
//     user: { $in: observerIds },
//   })
//     .populate({
//       path: "election",
//       select: "electionType startDate endDate",
//     })
//     .lean();

//   const updatedIncidentReports = await IncidentReport.find({
//     pollingUnit,
//     user: { $in: observerIds },
//   })
//     .populate({
//       path: "election",
//       select: "electionType startDate endDate",
//     })
//     .lean();

//   // Prepare election result data
//   const resultData = updatedElectionResults.map((result) => ({
//     electionId: result._id,
//     electionType: result.election.electionType,
//     pollingUnit: result.pollingUnit,
//     electionYear: result.election.startDate.substring(0, 4),
//     uploadedAt: result.createdAt,
//     partiesVotes: result.partiesVotes,
//     voteRating: result.voteRating,
//     voterIntimidation: result.voterIntimidation,
//     voteBuying: result.voteBuying,
//     resultPicture: result.resultPicture,
//     resultVideo: result.resultVideo,
//     agreed: result.agreed || false,
//     disagreed: result.disagreed || false,
//     actions: result.actions,
//     timeBegan: result.timeBegan,
//   }));

//   // Prepare incident report data
//   const reportData = updatedIncidentReports.map((report) => ({
//     electionId: report._id,
//     electionType: report.election.electionType,
//     pollingUnit: report.pollingUnit,
//     electionYear: report.election.startDate.substring(0, 4),
//     uploadedAt: report.createdAt,
//     selectIncident: report.selectIncident,
//     incidentNote: report.incidentNote,
//     electionRating: report.electionRating,
//     incidentPictures: report.incidentPictures,
//     incidentVideos: report.incidentVideos,
//     agreed: report.agreed || false,
//     disagreed: report.disagreed || false,
//     actions: report.actions,
//   }));

//   return {
//     results: resultData,
//     incidentReports: reportData,
//   };
// };

export const getResultsAndPerformAction = async (userId, actionData) => {
  // Fetch user to get polling unit
  const user = await CompletedUser.findById(userId).lean();
  if (!user || !user.pollingUnit) {
    throw new Error("User not found or polling unit is missing");
  }

  const pollingUnit = user.pollingUnit;

  // Fetch all observers in the same polling unit
  const observers = await CompletedUser.find({
    pollingUnit,
    role: "observer",
    isObserverInPollingUnit: true,
  }).lean();
  const observerIds = observers.map((observer) => observer._id);

  // Fetch election results uploaded by observers in the polling unit with isApproved field
  const electionResults = await ElectionData.find({
    pollingUnit,
    user: { $in: observerIds },
    isApproved: { $exists: true }, // Filter for results where isApproved field exists
  })
    .populate({
      path: "election",
      select: "electionType electionName startDate endDate",
    })
    .lean();

  // Fetch incident reports uploaded by observers in the polling unit
  const incidentReports = await IncidentReport.find({
    pollingUnit,
    user: { $in: observerIds },
  })
    .populate({
      path: "election",
      select: "electionType electionName startDate endDate",
    })
    .lean();

  // If actionData is provided, perform the action
  if (
    actionData &&
    actionData.electionId &&
    actionData.action &&
    actionData.dataType
  ) {
    let dataModel;

    // Determine the model based on the data type
    if (actionData.dataType === "election") {
      dataModel = ElectionData;
    } else if (actionData.dataType === "incident") {
      dataModel = IncidentReport;
    } else {
      throw new Error(
        "Invalid data type. It must be 'election' or 'incident'."
      );
    }

    // Find the election result or incident report by electionId
    const data = await dataModel.findById(actionData.electionId);
    if (!data) {
      throw new Error(
        `${
          actionData.dataType === "election"
            ? "Election result"
            : "Incident report"
        } not found`
      );
    }

    // Handle user action
    const existingAction = data.actions.find(
      (a) => a.userId.toString() === userId.toString()
    );

    if (existingAction) {
      // Update existing action
      if (actionData.action === "agree") {
        // User can agree if they haven't flagged it
        if (existingAction.action !== "flag") {
          existingAction.action = "agree";
          data.agreed = true;
          data.flagged = false;
        } else {
          throw new Error("You cannot agree after flagging the result.");
        }
      } else if (actionData.action === "flag") {
        // Ensure flagReason is provided
        if (!actionData.flagReason) {
          throw new Error("Flag reason is required when flagging.");
        }
        // Flag the result or report with a reason
        existingAction.action = "flag";
        existingAction.flagReason = actionData.flagReason;
        data.flagged = true;
        data.agreed = false;
      } else if (actionData.action === "unagree") {
        // Allow the user to unclick "agree" only if they agreed before
        if (existingAction.action === "agree") {
          existingAction.action = "unagree";
          data.agreed = false;
        } else {
          throw new Error("You haven't agreed to this result/report.");
        }
      }
    } else {
      // Add new action to the actions array
      const newAction = { userId, action: actionData.action };
      if (actionData.action === "flag") {
        // Ensure flagReason is provided for flagging
        if (!actionData.flagReason) {
          throw new Error("Flag reason is required when flagging.");
        }
        newAction.flagReason = actionData.flagReason;
        data.flagged = true;
        data.agreed = false;
      } else if (actionData.action === "agree") {
        if (!data.flagged) {
          data.agreed = true;
        } else {
          throw new Error("You cannot agree after flagging the result.");
        }
      }
      data.actions.push(newAction);
    }

    // Save the updated election result or incident report
    await data.save();
  }

  // Prepare election result data
  const resultData = electionResults.map((result) => ({
    electionId: result._id,
    electionType: result.election.electionType,
    pollingUnit: result.pollingUnit,
    electionYear: result.election.startDate.substring(0, 4),
    uploadedAt: result.createdAt,
    partiesVotes: result.partiesVotes,
    voteRating: result.voteRating,
    voterIntimidation: result.voterIntimidation,
    voteBuying: result.voteBuying,
    resultPicture: result.resultPicture,
    resultVideo: result.resultVideo,
    agreed: result.agreed || false,
    flagged: result.flagged || false,
    actions: result.actions,
    timeBegan: result.timeBegan,
    isApproved: result.isApproved, // Include the isApproved field
  }));

  // Prepare incident report data
  const reportData = incidentReports.map((report) => ({
    electionId: report._id,
    electionType: report.election.electionType,
    pollingUnit: report.pollingUnit,
    electionYear: report.election.startDate.substring(0, 4),
    uploadedAt: report.createdAt,
    selectIncident: report.selectIncident,
    incidentNote: report.incidentNote,
    electionRating: report.electionRating,
    incidentPictures: report.incidentPictures,
    incidentVideos: report.incidentVideos,
    agreed: report.agreed || false,
    flagged: report.flagged || false,
    actions: report.actions,
  }));

  return {
    results: resultData,
    incidentReports: reportData,
  };
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
        voterIntimidation: 0,
        voteBuying: 0,
        goodRating: 0,
        okayRating: 0,
        poorRating: 0,
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
        pollingUnitData.partiesVotes[party] =
          (pollingUnitData.partiesVotes[party] || 0) + count;
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
    } else if (voteRating === "poor") {
      pollingUnitData.poorRating++;
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
  return Object.entries(aggregated).map(([state, stateData]) => ({
    state,
    totalVotes: stateData.totalVotes,
    localGovernments: Object.entries(stateData.localGovernments).map(
      ([lga, lgaData]) => ({
        localGovernment: lga,
        totalVotes: lgaData.totalVotes,
        wards: Object.entries(lgaData.wards).map(([ward, wardData]) => ({
          ward,
          totalVotes: wardData.totalVotes,
          pollingUnits: Object.entries(wardData.pollingUnits).map(
            ([pollingUnit, pollingUnitData]) => ({
              pollingUnit,
              totalVotes: pollingUnitData.totalVotes,
              partiesVotes: formatVoteCounts(pollingUnitData.partiesVotes),
              voterIntimidation: pollingUnitData.voterIntimidation,
              voteBuying: pollingUnitData.voteBuying,
              goodRating: pollingUnitData.goodRating,
              okayRating: pollingUnitData.okayRating,
              poorRating: pollingUnitData.poorRating,
              resultPictures: pollingUnitData.resultPictures,
              resultVideos: pollingUnitData.resultVideos,
            })
          ),
        })),
      })
    ),
  }));
};

const formatAggregatedIncidents = (aggregated) => {
  return Object.entries(aggregated).map(([state, stateData]) => ({
    state,
    totalIncidents: stateData.totalIncidents,
    localGovernments: Object.entries(stateData.localGovernments).map(
      ([lga, lgaData]) => ({
        localGovernment: lga,
        totalIncidents: lgaData.totalIncidents,
        wards: Object.entries(lgaData.wards).map(([ward, wardData]) => ({
          ward,
          totalIncidents: wardData.totalIncidents,
          incidentTypes: formatIncidentCounts(wardData.incidentTypes),
        })),
      })
    ),
  }));
};

const formatVoteCounts = (votes) => {
  return Object.entries(votes).map(([party, count]) => ({ party, count }));
};

const formatIncidentCounts = (incidents) => {
  return Object.entries(incidents).map(([type, count]) => ({ type, count }));
};