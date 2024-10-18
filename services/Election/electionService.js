import Election from "../../models/Election/Election.js";
import ElectionData from "../../models/Election/ElectionData.js";
import CompletedUser from "../../models/CompletedUser.js";
import { politicalParties } from "../../models/Election/PoliticalParty.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import Notification from "../../models/DailyTraffic/Notification.js";
import File from "../../models/file.js";
import path from "path";
import mongoose from "mongoose";
import moment from "moment";


export const createElectionService = async (data) => {
  const { electionType, electionName, electionLocation, startDate, endDate } = data;

  const existingElection = await Election.findOne({
    electionType,
    electionName,
    electionLocation,
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
  const election = new Election({ electionType, electionName, electionLocation, startDate, endDate });

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
      rejectedVoters,
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
      return existingResult;
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

    // Create a notification for the result upload
    const electionType = election.electionType || "Election";
    const stateName = user.state || "State";
    const uploadNotification = new Notification({
      type: "result-upload",
      body: `Result uploaded for ${stateName} ${electionType}`,
      info: `${stateName} ${electionType} Election`,
    });
    await uploadNotification.save();

    // Create or Update pending approval notification
    const pendingCount = await ElectionData.countDocuments({
      election: electionId,
      isApproved: false, 
    });

    const pendingNotification = new Notification({
      type: "pending-approval",
      body: `${pendingCount} pending approval for ${stateName}`,
      info: `${electionType} Election`,
    });

    await pendingNotification.save();

    // Convert to a plain object and remove isApproved if not applicable
    const resultData = savedResultData.toObject();
    if (isApproved === null) {
      delete resultData.isApproved; 
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

// export const uploadIncidentReportDataService = async (
//   electionId,
//   userId,
//   data,
//   files
// ) => {
//   try {
//     const { selectIncident, incidentNote, electionRating } = data;

//     // Check election existence
//     const election = await Election.findById(electionId);
//     if (!election) {
//       throw new Error("Election not found");
//     }

//     // Check user existence
//     const user = await CompletedUser.findById(userId);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Check if an incident report already exists
//     const existingReport = await IncidentReport.findOne({
//       election: electionId,
//       user: userId,
//     });
//     if (existingReport) return existingReport;

//     // Validate file types
//     const validateFile = (file, allowedExtensions) => {
//       const ext = path.extname(file.originalname).toLowerCase();
//       if (!allowedExtensions.includes(ext)) {
//         throw new Error(
//           `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`
//         );
//       }
//       return {
//         location: file.path,
//         name: file.originalname,
//         type: file.mimetype,
//         size: file.size,
//       };
//     };

//     // Process and validate incident videos
//     const incidentVideos = files?.["incidentVideos"]?.length
//       ? files["incidentVideos[]"].map((file) =>
//           validateFile(file, [".mp4", ".avi", ".mov", ".webm", ".wmv"])
//         )
//       : [];

//     // Process and validate incident pictures
//     const incidentPictures = files?.["incidentPictures"]?.length
//       ? files["incidentPictures[]"].map((file) =>
//           validateFile(file, [".jpg", ".jpeg", ".png", ".svg"])
//         )
//       : [];

//     // Insert files if any are provided
//     const insertedPictures = incidentPictures.length
//       ? await File.insertMany(incidentPictures)
//       : [];
//     const insertedVideos = incidentVideos.length
//       ? await File.insertMany(incidentVideos)
//       : [];

//     // Create and save the incident report
//     const incidentReport = new IncidentReport({
//       election: electionId,
//       user: userId,
//       userRole: user.role,
//       state: user.state,
//       lga: user.lga,
//       ward: user.ward,
//       pollingUnit: user.pollingUnit,
//       selectIncident,
//       incidentNote,
//       electionRating,
//       incidentPictures: insertedPictures,
//       incidentVideos: insertedVideos,
//     });

//     const savedReport = await incidentReport.save();

//     // Link the incident report to the election
//     election.incidentReports.push(savedReport);
//     await election.save();

//     return savedReport;
//   } catch (error) {
//     console.error("Error uploading incident report data:", error);
//     throw new Error(`Error saving election incident: ${error.message}`);
//   }
// };


// export const uploadIncidentReportDataService = async (
//   electionId,
//   userId,
//   data,
//   files
// ) => {
//   try {
//     const { selectIncident, incidentNote, electionRating } = data;

//     // Rename files if they are sent without `[]` in Postman or frontend
//     if (files?.incidentPictures) {
//       files["incidentPictures[]"] = files.incidentPictures;
//       delete files.incidentPictures;
//     }

//     if (files?.incidentVideos) {
//       files["incidentVideos[]"] = files.incidentVideos;
//       delete files.incidentVideos;
//     }

//     // Check if the election exists
//     const election = await Election.findById(electionId);
//     if (!election) {
//       throw new Error("Election not found");
//     }

//     // Check if the user exists
//     const user = await CompletedUser.findById(userId);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Check if an incident report already exists
//     const existingReport = await IncidentReport.findOne({
//       election: electionId,
//       user: userId,
//     });
//     if (existingReport) return existingReport;

//     // Helper function to validate file types
//     const validateFile = (file, allowedExtensions) => {
//       const ext = path.extname(file.originalname).toLowerCase();
//       if (!allowedExtensions.includes(ext)) {
//         throw new Error(
//           `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`
//         );
//       }
//       return {
//         location: file.path,
//         name: file.originalname,
//         type: file.mimetype,
//         size: file.size,
//       };
//     };

//     // Process and validate incident videos
//     const incidentVideos = files?.["incidentVideos[]"]?.length
//       ? files["incidentVideos[]"].map((file) =>
//           validateFile(file, [".mp4", ".avi", ".mov", ".webm", ".wmv"])
//         )
//       : [];

//     // Process and validate incident pictures
//     const incidentPictures = files?.["incidentPictures[]"]?.length
//       ? files["incidentPictures[]"].map((file) =>
//           validateFile(file, [".jpg", ".jpeg", ".png", ".svg"])
//         )
//       : [];

//     // Insert files if any are provided
//     const insertedPictures = incidentPictures.length
//       ? await File.insertMany(incidentPictures)
//       : [];
//     const insertedVideos = incidentVideos.length
//       ? await File.insertMany(incidentVideos)
//       : [];

//     // Create and save the incident report
//     const incidentReport = new IncidentReport({
//       election: electionId,
//       user: userId,
//       userRole: user.role,
//       state: user.state,
//       lga: user.lga,
//       ward: user.ward,
//       pollingUnit: user.pollingUnit,
//       selectIncident,
//       incidentNote,
//       electionRating,
//       incidentPictures: insertedPictures,
//       incidentVideos: insertedVideos,
//     });

//     const savedReport = await incidentReport.save();

//     // Link the incident report to the election
//     election.incidentReports.push(savedReport);
//     await election.save();

//     return savedReport;
//   } catch (error) {
//     console.error("Error uploading incident report data:", error);
//     throw new Error(`Error saving election incident: ${error.message}`);
//   }
// };

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
    if (!election) throw new Error("Election not found");

    // Check user existence
    const user = await CompletedUser.findById(userId);
    if (!user) throw new Error("User not found");

    // Check if incident report exists
    const existingReport = await IncidentReport.findOne({
      election: electionId,
      user: userId,
    });
    if (existingReport) return existingReport;

    // Validate files
    const validateFile = (file, allowedExtensions) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error(
          `Invalid file type. Please upload one of the following: ${allowedExtensions.join(
            ", "
          )}`
        );
      }
      return {
        location: file.path,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
      };
    };

    // Process incident videos and pictures
    const incidentVideos =
      files["incidentVideos[]"]?.map((file) =>
        validateFile(file, [".mp4", ".avi", ".mov", ".webm", ".wmv"])
      ) || [];

    const incidentPictures =
      files["incidentPictures[]"]?.map((file) =>
        validateFile(file, [".jpg", ".jpeg", ".png", ".svg"])
      ) || [];

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
      incidentPictures: await File.insertMany(incidentPictures),
      incidentVideos: await File.insertMany(incidentVideos),
    });

    // Save and return
    const savedReport = await incidentReport.save();
    election.incidentReports.push(savedReport);
    await election.save();

    return savedReport;
  } catch (error) {
    console.error("Error uploading incident report data", error);
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
      previousIncidentPictures,
      previousIncidentVideos,
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

      const incidentVideos = files["incidentVideos[]"]
      const incidentPictures = files["incidentPictures[]"]

      console.log(incidentVideos, incidentPictures)
    // Handle video files
    const previousIncidentVideoFiles = previousIncidentVideos?.length
      ? await File.find({ _id: { $in: previousIncidentVideos } })
      : [];
    const newIncidentVideoFiles = incidentVideos?.length
      ? incidentVideos.map((file) => formatFileDetails(file))
      : [];
    const newVideos = newIncidentVideoFiles.length
      ? await File.insertMany(newIncidentVideoFiles)
      : [];

    // Merge old and new videos
    report.incidentVideos = [...previousIncidentVideoFiles, ...newVideos];

    // Handle picture files
    const previousIncidentPictureFiles = previousIncidentPictures?.length
      ? await File.find({ _id: { $in: previousIncidentPictures } })
      : [];
    const newIncidentPictureFiles = incidentPictures?.length
      ? incidentPictures.map((file) => formatFileDetails(file))
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
  // const observers = await CompletedUser.find({
  //   pollingUnit,
  //   role: "observer",
  //   // isObserverInPollingUnit: true,
  // }).lean();

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

  const electionResults = await ElectionData.find({
    pollingUnit,
    // user: { $in: observerIds },
  })
    .populate({
      path: "election",
      select: "electionType electionName electionLocation startDate endDate",
    })
    .lean();

  // Fetch incident reports uploaded by observers in the polling unit
  const incidentReports = await IncidentReport.find({
    pollingUnit,
    // user: { $in: observerIds },
  })
    .populate({
      path: "election",
      select: "electionType electionName electionLocation startDate endDate",
    })
    .lean();

  console.log(incidentReports, electionResults);

  // Prepare election result data
  const resultData = electionResults.map((result) => ({
    electionId: result._id,
    electionType: result.election.electionType,
    pollingUnit: result.pollingUnit,
    electionYear: moment(result.election.startDate).format('YYYY'),
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
    isApproved: result.isApproved,
    election: result.election
  }));

  // Prepare incident report data
  const reportData = incidentReports.map((report) => ({
    electionId: report._id,
    electionType: report.election.electionType,
    pollingUnit: report.pollingUnit,
    electionYear: moment(report.election.startDate).format("YYYY"),
    uploadedAt: report.createdAt,
    selectIncident: report.selectIncident,
    incidentNote: report.incidentNote,
    electionRating: report.electionRating,
    incidentPictures: report.incidentPictures,
    incidentVideos: report.incidentVideos,
    agreed: report.agreed || false,
    flagged: report.flagged || false,
    actions: report.actions,
    election: report.election,
  }));

  return {
    results: resultData,
    incidentReports: reportData,
  };
};


// Helper function to aggregate and get the top parties

// const aggregateResultsAndTopParties = (results, groupBy = "state") => {
//   const aggregated = {};
//   const totalVotesByParty = {}; // To track the total votes for each party across all results

//   // Step 1: Aggregating votes from polling unit -> ward -> lga -> state
//   results.forEach((result) => {
//     const { state, lga, ward, partiesVotes, userRole } = result;

//     // Only consider results from observers
//     if (userRole !== "observer") return;

//     // Determine aggregation key based on groupBy parameter
//     let key;
//     if (groupBy === "state") {
//       key = state;
//     } else if (groupBy === "lga") {
//       key = lga;
//     } else if (groupBy === "ward") {
//       key = ward;
//     } else {
//       throw new Error(
//         "Invalid groupBy value. It must be 'state', 'lga', or 'ward'."
//       );
//     }

//     // Initialize the aggregation structure if not exists
//     if (!aggregated[key]) {
//       aggregated[key] = { totalVotes: 0, partiesVotes: {} };
//     }

//     // Step 2: Aggregate partiesVotes at polling unit level
//     partiesVotes.forEach(({ party, count }) => {
//       // Aggregate the votes for each party at the key level (state, lga, or ward)
//       aggregated[key].partiesVotes[party] =
//         (aggregated[key].partiesVotes[party] || 0) + count;
//       aggregated[key].totalVotes += count;

//       // Accumulate total votes across all results for each party (for aggregate analysis)
//       totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
//     });
//   });

//   // Step 3: Format aggregated results and get top three parties
//   const chart = Object.entries(aggregated).map(([key, data]) => ({
//     [groupBy]: key, // This will either be 'state', 'lga', or 'ward' based on aggregation
//     ...getTopThreeParties(data.partiesVotes),
//   }));

//   // Step 4: Prepare the aggregate analysis (total votes for each party)
//   const aggregateanalysis = Object.keys(totalVotesByParty).reduce(
//     (acc, party) => {
//       acc[party] = totalVotesByParty[party];
//       return acc;
//     },
//     {}
//   );

//   return { chart, aggregateanalysis };
// };

// // Helper function to get top three parties (consider ties for third place)
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


// export const getNationalResults = async (electionId) => {
//   // Fetch election data for observers
//   const electionResults = await ElectionData.find({
//     election: electionId,
//     userRole: "observer",
//   }).lean();

//   // Aggregate results by state and get top three parties
//   const { chart, aggregateanalysis } = aggregateResultsAndTopParties(
//     electionResults,
//     "state"
//   );

//   // Registered and submitted states count
//   const allStates = new Set(electionResults.map((result) => result.state));
//   const submittedStates = new Set(
//     electionResults
//       .filter((result) => result.partiesVotes.length)
//       .map((result) => result.state)
//   );

//   const footer = {
//     "registered-states": allStates.size,
//     "submitted-states": submittedStates.size,
//   };

//   // Fetch election details
//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   // Return the election details, chart, footer, and aggregate analysis
//   return { electionDetails, chart, footer, aggregateanalysis };
// };

// // Fetch results for senatorial election
// export const getSenatorialResults = async (electionId, user) => {
//   const userLGA = user.lga;

//   // Find the senatorial district for the user's LGA
//   const districtData = lgaData.find(
//     (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
//   );

//   if (!districtData || !districtData.senatorial_district) {
//     throw new Error("Senatorial district not found for user LGA");
//   }


//   // Fetch election results for all LGAs in the same senatorial district
//   const allLGAsInDistrict = lgaData
//     .filter(
//       (lga) => lga.senatorial_district === districtData.senatorial_district
//     )
//     .map((lga) => lga.name);

//   const electionResults = await ElectionData.find({
//     election: electionId,
//     lga: { $in: allLGAsInDistrict },
//     // isApproved: true,
//     userRole: "observer",
//   }).lean();

//   // Aggregate by LGA
//   const { chart, aggregateanalysis } = aggregateResultsAndTopParties(
//     electionResults,
//     "lga"
//   );

//   // Registered and submitted LGAs
//   const submittedLGAs = new Set(
//     electionResults
//       .filter((result) => result.partiesVotes.length)
//       .map((result) => result.lga)
//   );

//   const footer = {
//     "registered-LGAs": allLGAsInDistrict.length,
//     "submitted-LGAs": submittedLGAs.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   return {
//     electionDetails,
//     chart,
//     footer,
//     restriction: {
//       name: "Senatorial District",
//       value: districtData.senatorial_district,
//     },
//     aggregateanalysis,
//   };
// };

// // Fetch results for gubernatorial election
// export const getGubernatorialResults = async (electionId, user) => {
//   const electionResults = await ElectionData.find({
//     election: electionId,
//     state: user.state,
//     // isApproved: true,
//     userRole: "observer",
//   }).lean();

//   // Aggregate by LGA
//   const { chart, aggregateanalysis } = aggregateResultsAndTopParties(
//     electionResults,
//     "lga"
//   );

//   // Registered and submitted LGAs
//   const allLGAsInState = new Set(electionResults.map((result) => result.lga));
//   const submittedLGAs = new Set(
//     electionResults
//       .filter((result) => result.partiesVotes.length)
//       .map((result) => result.lga)
//   );

//   const footer = {
//     "registered-LGAs": allLGAsInState.size,
//     "submitted-LGAs": submittedLGAs.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   return { electionDetails, chart, footer, aggregateanalysis };
// };

// // Fetch results for House of Reps election
// export const getHouseOfRepsResults = async (electionId, user) => {
//   const userLGA = user.lga;

//   // Find the House of Representatives district for the user's LGA
//   const districtData = lgaData.find(
//     (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
//   );

//   if (!districtData || !districtData.house_of_representatives) {
//     throw new Error("House of Representatives district not found for user LGA");
//   }

//   // Fetch election results for all LGAs in the same district
//   const allLGAsInDistrict = lgaData
//     .filter(
//       (lga) =>
//         lga.house_of_representatives === districtData.house_of_representatives
//     )
//     .map((lga) => lga.name);

//   const electionResults = await ElectionData.find({
//     election: electionId,
//     lga: { $in: allLGAsInDistrict },
//     // isApproved: true,
//     userRole: "observer",
//   }).lean();

//   // Aggregate by LGA
//   const { chart, aggregateanalysis } = aggregateResultsAndTopParties(
//     electionResults,
//     "lga"
//   );

//   // Registered and submitted LGAs
//   const submittedLGAs = new Set(
//     electionResults
//       .filter((result) => result.partiesVotes.length)
//       .map((result) => result.lga)
//   );

//   const footer = {
//     "registered-LGAs": allLGAsInDistrict.length,
//     "submitted-LGAs": submittedLGAs.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   return {
//     electionDetails,
//     chart,
//     footer,
//     restriction: {
//       name: "House of Reps",
//       value: districtData.house_of_representatives,
//     },
//     aggregateanalysis,
//   };
// };

// // Fetch results for house of assembly election
// export const getHouseOfAssemblyResults = async (electionId, user) => {
//   const electionResults = await ElectionData.find({
//     election: electionId,
//     state: user.state,
//     // isApproved: true,
//     userRole: "observer",
//   }).lean();

//   // Aggregate by LGA
//   const { chart, aggregateanalysis } = aggregateResultsAndTopParties(
//     electionResults,
//     "lga"
//   );

//   // Registered and submitted LGAs
//   const allLGAsInState = new Set(electionResults.map((result) => result.lga));
//   const submittedLGAs = new Set(
//     electionResults
//       .filter((result) => result.partiesVotes.length)
//       .map((result) => result.lga)
//   );



//   const footer = {
//     "registered-LGAs": allLGAsInState.size,
//     "submitted-LGAs": submittedLGAs.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   return { electionDetails, chart, footer, aggregateanalysis };
// };

// export const getLocalGovernmentResults = async (electionId, user) => {
//   const electionResults = await ElectionData.find({
//     election: electionId,
//     lga: user.lga,
//     // isApproved: true,
//     userRole: "observer",
//   }).lean();

//   // Aggregate by Ward
//   const { chart, aggregateanalysis } = aggregateResultsAndTopParties(
//     electionResults,
//     "ward"
//   );

//   // Registered and submitted wards
//   const allWardsInLGA = new Set(electionResults.map((result) => result.ward));
//   const submittedWards = new Set(
//     electionResults
//       .filter((result) => result.partiesVotes.length)
//       .map((result) => result.ward)
//   );

//   const footer = {
//     "registered-wards": allWardsInLGA.size,
//     "submitted-wards": submittedWards.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   return { electionDetails, chart, footer, aggregateanalysis };
// };

// // Incident Report Aggregate Analysis

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

//   // Step 1: Aggregating incident counts based on the location
//   incidents.forEach((incident) => {
//     const { state, lga, ward, selectIncident } = incident;

//     // Determine aggregation key based on groupBy parameter
//     let key;
//     if (groupBy === "state") {
//       key = state;
//     } else if (groupBy === "lga") {
//       key = lga;
//     } else if (groupBy === "ward") {
//       key = ward;
//     } else {
//       throw new Error(
//         "Invalid groupBy value. It must be 'state', 'lga', or 'ward'."
//       );
//     }

//     // Initialize the aggregation structure if not exists
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

//     // Increment incident count for the respective location and incident type
//     aggregated[key][selectIncident]++;

//     // Update total incident counts for the aggregate analysis
//     totalIncidentCounts[selectIncident]++;
//   });

//   // Step 2: Format the chart with the incident data for each location
//   const chart = Object.entries(aggregated).map(([key, incidents]) => ({
//     [groupBy]: key,
//     ...incidents,
//   }));

//   return { chart, totalIncidentCounts };
// };

// export const getNationalIncidentReports = async (electionId) => {
//   // Fetch incident reports for the national election
//   const incidents = await IncidentReport.find({
//     election: electionId,
//   }).lean();

//   // Aggregate incident reports by state
//   const { chart, totalIncidentCounts } = aggregateIncidentsByLocation(
//     incidents,
//     "state"
//   );

//   // Registered and submitted states count
//   const allStates = new Set(incidents.map((incident) => incident.state));
//   const submittedStates = new Set(
//     incidents
//       .filter((incident) => incident.selectIncident)
//       .map((incident) => incident.state)
//   );

//   const footer = {
//     "registered-states": allStates.size,
//     "submitted-states": submittedStates.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   // Return the election details, incident chart, footer, and aggregate analysis
//   return {
//     electionDetails,
//     chart,
//     footer,
//     aggregateanalysis: totalIncidentCounts,
//   };
// };

// export const getSenatorialIncidentReports = async (electionId, user) => {
//   const userLGA = user.lga;

//   // Find the senatorial district for the user's LGA
//   const districtData = lgaData.find(
//     (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
//   );

//   if (!districtData || !districtData.senatorial_district) {
//     throw new Error("Senatorial district not found for user LGA");
//   }

//   // Fetch incident reports for all LGAs in the same senatorial district
//   const allLGAsInDistrict = lgaData
//     .filter(
//       (lga) => lga.senatorial_district === districtData.senatorial_district
//     )
//     .map((lga) => lga.name);

//   const incidents = await IncidentReport.find({
//     election: electionId,
//     lga: { $in: allLGAsInDistrict },
//   }).lean();

//   // Aggregate incident reports by LGA
//   const { chart, totalIncidentCounts } = aggregateIncidentsByLocation(
//     incidents,
//     "lga"
//   );

//   // Registered and submitted LGAs count
//   const submittedLGAs = new Set(incidents.map((incident) => incident.lga));

//   const footer = {
//     "registered-LGAs": allLGAsInDistrict.length,
//     "submitted-LGAs": submittedLGAs.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   // Return the election details, incident chart, footer, and aggregate analysis
//   return {
//     electionDetails,
//     chart,
//     footer,
//     aggregateanalysis: totalIncidentCounts,
//     restriction: {
//       name: "Senatorial District",
//       value: districtData.senatorial_district,
//     },
//   };
// };

// export const getHouseOfRepsIncidentReports = async (electionId, user) => {
//   const userLGA = user.lga;

//   // Find the House of Representatives district for the user's LGA
//   const districtData = lgaData.find(
//     (lga) => lga.name.toUpperCase() === userLGA.toUpperCase()
//   );

//   if (!districtData || !districtData.house_of_representatives) {
//     throw new Error("House of Representatives district not found for user LGA");
//   }

//   // Fetch incident reports for all LGAs in the same House of Reps district
//   const allLGAsInDistrict = lgaData
//     .filter(
//       (lga) =>
//         lga.house_of_representatives === districtData.house_of_representatives
//     )
//     .map((lga) => lga.name);

//   const incidents = await IncidentReport.find({
//     election: electionId,
//     lga: { $in: allLGAsInDistrict },
//   }).lean();

//   // Aggregate incident reports by LGA
//   const { chart, totalIncidentCounts } = aggregateIncidentsByLocation(
//     incidents,
//     "lga"
//   );

//   // Registered and submitted LGAs count
//   const submittedLGAs = new Set(incidents.map((incident) => incident.lga));

//   const footer = {
//     "registered-LGAs": allLGAsInDistrict.length,
//     "submitted-LGAs": submittedLGAs.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   // Return the election details, incident chart, footer, and aggregate analysis
//   return {
//     electionDetails,
//     chart,
//     footer,
//     aggregateanalysis: totalIncidentCounts,
//     restriction: {
//       name: "House of Reps",
//       value: districtData.house_of_representatives,
//     },
//   };
// };

// export const getGubernatorialIncidentReports = async (electionId, user) => {
//   // Fetch incident reports for the user's state
//   const incidents = await IncidentReport.find({
//     election: electionId,
//     state: user.state,
//   }).lean();

//   // Aggregate incident reports by LGA
//   const { chart, totalIncidentCounts } = aggregateIncidentsByLocation(
//     incidents,
//     "lga"
//   );

//   // Registered and submitted LGAs count
//   const allLGAsInState = new Set(
//     lgaData.filter((lga) => lga.state === user.state).map((lga) => lga.name)
//   );
//   const submittedLGAs = new Set(incidents.map((incident) => incident.lga));

//   const footer = {
//     "registered-LGAs": allLGAsInState.size,
//     "submitted-LGAs": submittedLGAs.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   // Return the election details, incident chart, footer, and aggregate analysis
//   return {
//     electionDetails,
//     chart,
//     footer,
//     aggregateanalysis: totalIncidentCounts,
//   };
// };

// export const getHouseOfAssIncidentReports = async (electionId, user) => {
//   // Fetch incident reports for the user's state
//   const incidents = await IncidentReport.find({
//     election: electionId,
//     state: user.state,
//   }).lean();

//   // Aggregate incident reports by LGA
//   const { chart, totalIncidentCounts } = aggregateIncidentsByLocation(
//     incidents,
//     "lga"
//   );

//   // Registered and submitted LGAs count
//   const allLGAsInState = new Set(
//     lgaData.filter((lga) => lga.state === user.state).map((lga) => lga.name)
//   );
//   const submittedLGAs = new Set(incidents.map((incident) => incident.lga));

//   const footer = {
//     "registered-LGAs": allLGAsInState.size,
//     "submitted-LGAs": submittedLGAs.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   // Return the election details, incident chart, footer, and aggregate analysis
//   return {
//     electionDetails,
//     chart,
//     footer,
//     aggregateanalysis: totalIncidentCounts,
//   };
// };

// export const getLocalGovernmentIncidentReports = async (electionId, user) => {
//   // Fetch incident reports for the user's LGA
//   const incidents = await IncidentReport.find({
//     election: electionId,
//     lga: user.lga,
//   }).lean();

//   // Aggregate incident reports by Ward
//   const { chart, totalIncidentCounts } = aggregateIncidentsByLocation(
//     incidents,
//     "ward"
//   );

//   // Registered and submitted Wards count
//   const allWardsInLGA = new Set(
//     lgaData.filter((lga) => lga.name === user.lga).map((ward) => ward.name)
//   );
//   const submittedWards = new Set(incidents.map((incident) => incident.ward));

//   const footer = {
//     "registered-wards": allWardsInLGA.size,
//     "submitted-wards": submittedWards.size,
//   };

//   const electionDetails = await Election.findById(electionId)
//     .select("electionType electionName electionLocation startDate endDate")
//     .lean();

//   // Return the election details, incident chart, footer, and aggregate analysis
//   return {
//     electionDetails,
//     chart,
//     footer,
//     aggregateanalysis: totalIncidentCounts,
//   };
// };


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

//     // Only include data from observers
//     if (userRole !== "observer") return;

//     // Determine aggregation key (state, lga, or ward)
//     let key;
//     if (groupBy === "state") {
//       key = state;
//     } else if (groupBy === "lga") {
//       key = lga;
//     } else if (groupBy === "ward") {
//       key = ward;
//     } else {
//       throw new Error(
//         "Invalid groupBy value. It must be 'state', 'lga', or 'ward'."
//       );
//     }

//     // Initialize aggregation structure if it doesn't exist
//     if (!aggregated[key]) {
//       aggregated[key] = {
//         voteRating: { good: 0, okay: 0, poor: 0 },
//         voterIntimidation: { yes: 0, no: 0 },
//         voteBuying: { yes: 0, no: 0 },
//       };
//     }

//     // Aggregate voteRating counts
//     if (voteRating) {
//       aggregated[key].voteRating[voteRating] += 1;
//     }

//     // Aggregate voterIntimidation counts
//     if (voterIntimidation) {
//       aggregated[key].voterIntimidation[voterIntimidation] += 1;
//     }

//     // Aggregate voteBuying counts
//     if (voteBuying) {
//       aggregated[key].voteBuying[voteBuying] += 1;
//     }
//   });

//   return aggregated;
// };

// const formatSentimentAnalysis = (aggregatedSentiment, groupBy) => {
//   return Object.entries(aggregatedSentiment).map(([key, sentimentData]) => ({
//     [groupBy]: key,
//     voteRating: sentimentData.voteRating,
//     voterIntimidation: sentimentData.voterIntimidation,
//     voteBuying: sentimentData.voteBuying,
//   }));
// };

// // Service function to fetch sentiment analysis data based on electionId and user details
// export const getSentimentAnalysisService = async (
//   electionId,
//   groupBy = "state"
// ) => {
//   const electionData = await ElectionData.find({
//     election: electionId,
//     userRole: "observer",
//   }).lean();

//   // Perform sentiment analysis aggregation
//   const aggregatedSentiment = aggregateSentimentAnalysis(electionData, groupBy);

//   // Format the aggregated sentiment analysis data
//   return formatSentimentAnalysis(aggregatedSentiment, groupBy);
// };



