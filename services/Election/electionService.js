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

const BACKEND_URL = process.env.BACKEND_URL;

export const createElectionService = async (data) => {
  const { electionType, electionName, startDate, endDate, electionLocation } =
    data;

  const existingElection = await Election.findOne({
    electionType,
    electionName,
    startDate,
    endDate,
    electionLocation,
  });
  if (existingElection) {
    const error = new Error(
      "Election already exists for this type and date range"
    );
    error.statusCode = 400;
    throw error;
  }

  try{
  const election = new Election({ 
    electionType, 
    electionName,
    startDate, 
    endDate,
    electionLocation: Array.isArray(electionLocation) ? electionLocation : [electionLocation]
    });

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
  // Fetch the existing election to get the current electionLocation
  const existingElection = await Election.findById(electionId).lean();

  if (!existingElection) {
    const error = new Error("Election not found");
    error.statusCode = 404;
    throw error;
  }

  // Handle electionLocation updates by adding/removing based on the provided data
  if (data.electionLocation) {
    // Convert the input to an array if it's a single string
    let newLocations = Array.isArray(data.electionLocation)
      ? data.electionLocation
      : [data.electionLocation];

    // Standardize existing locations and new locations for consistent comparison
    const standardizedExistingLocations = existingElection.electionLocation.map(
      (loc) => standardizeName(loc)
    );

    const standardizedNewLocations = newLocations.map((loc) =>
      standardizeName(loc)
    );

    // Create a set to manage updated locations (remove duplicates)
    let updatedLocations = new Set(standardizedExistingLocations);

    // Check for additions or removals
    standardizedNewLocations.forEach((loc) => {
      if (updatedLocations.has(loc)) {
        // If it exists, remove it (this handles removal)
        updatedLocations.delete(loc);
      } else {
        // If it doesn't exist, add it (this handles addition)
        updatedLocations.add(loc);
      }
    });

    // Convert the updated set back to an array for MongoDB
    data.electionLocation = Array.from(updatedLocations);
  }

  // Update the election with the new data
  const updatedElection = await Election.findByIdAndUpdate(electionId, data, {
    new: true,
  }).lean();

  if (!updatedElection) {
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
  } = updatedElection;

  // Return the election data including electionLocation
  return electionData;

  // Helper function to standardize names (handles consistent formatting)
  function standardizeName(text) {
    return text
      .split(/\s|-/) // Split by space or hyphen
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
};


export const getAllElectionsService = async (userId) => {
  // Helper function to standardize names by replacing spaces and hyphens with underscores
  const standardizeName = (name) => {
    return name.toLowerCase().replace(/[-\s]/g, "_").trim();
  };

  const user = await CompletedUser.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  console.log(`Fetching elections for user: ${userId}`);
  const userState = standardizeName(user.state);
  const userLGA = standardizeName(user.lga);

  // Fetch all elections
  const elections = await Election.find()
    .populate({ path: "results", select: "election user" })
    .populate({ path: "incidentReports", select: "election user" });

  console.log(`User ID: ${userId}, State: ${user.state}, LGA: ${user.lga}`);

  // Filter elections based on the user's state or LGA and election type
  const relevantElections = elections.filter((election) => {
    const electionType = election.electionType.toLowerCase(); // Convert to lowercase
    const electionLocation = election.electionLocation.map((loc) =>
      standardizeName(loc)
    );

    switch (electionType) {
      case "national":
      case "gubernatorial":
      case "house-of-assembly":
        if (electionLocation.includes(userState)) {
          console.log(
            `Found relevant election for state: ${userState}, Election Type: ${electionType}`
          );
          return true;
        }
        break;
      case "senatorial":
      case "house-of-representatives":
      case "lga":
        if (electionLocation.includes(userLGA)) {
          console.log(
            `Found relevant election for LGA: ${userLGA}, Election Type: ${electionType}`
          );
          return true;
        }
        break;
      default:
        return false;
    }
    return false;
  });

  // Log if no elections were found
  if (relevantElections.length === 0) {
    console.log("No relevant elections found for user.");
    return [];
  }

  // Format and return relevant elections, excluding `electionLocation` from the response
  return relevantElections.map((election) => {
    const {
      electionLocation, // Do not include this field in the response
      politicalParties,
      resultsCount,
      incidentReports,
      results,
      ...electionData
    } = election.toObject();

    // Process and return results and incident reports as needed
    electionData.results = election.results
      .filter((result) => result.user.toString() === userId.toString())
      .map((result) => result._id);
    electionData.incidentReports = election.incidentReports
      .filter((report) => report.user.toString() === userId.toString())
      .map((report) => report._id);

    return electionData;
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

// export const getElectionById = async (electionId, userId) => {
//   try {
//     // Fetch the election data by ID
//     const election = await Election.findById(electionId).lean();
//     if (!election) {
//       throw new Error("Election not found");
//     }
//     console.log("election and user", electionId, userId);

//     // Fetch the election result data for the specific user and election
//     const result = await ElectionData.findOne({
//       election: electionId,
//       user: userId,
//     }).lean();

//     // Fetch the incident report data for the specific user and election
//     const incidentReport = await IncidentReport.findOne({
//       election: electionId,
//       user: userId,
//     }).lean();


//     // Create the election data object including political parties, results, and incident reports
//     const electionData = {
//       ...election,
//       politicalParties: politicalParties.map((party) => ({
//         name: party.name,
//         code: party.code,
//       })),
//       results: result ? [result] : [], 
//       incidentReports: incidentReport ? [incidentReport] : [],
//     };

//     // Remove the resultsCount field from the election data object
//     delete electionData.resultsCount;

//     return { election: electionData };
//   } catch (error) {
//     throw new Error(`Error fetching election data: ${error.message}`);
//   }
// };

export const getElectionById = async (electionId, userId) => {
  try {
    // Fetch the election data by ID
    const election = await Election.findById(electionId).lean();
    if (!election) {
      throw new Error("Election not found");
    }
    // console.log("Election and User:", electionId, userId);

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

    // Create the election data object including political parties, results, and incident reports
    const {
      electionLocation, 
      resultsCount, 
      ...electionData
    } = election;


    // Include only required data and format political parties properly
    const formattedElectionData = {
      ...electionData,
      politicalParties: politicalParties.map((party) => ({
        name: party.name,
        code: party.code,
      })),
      results: result ? [result] : [],
      incidentReports: incidentReport ? [incidentReport] : [],
    };

    return { election: formattedElectionData };
  } catch (error) {
    throw new Error(`Error fetching election data: ${error.message}`);
  }
};

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
      const resultPicturePath = `/resultpicture/${path.basename(files.resultPicture[0].path)}`;

      resultPicture = await File.create({
        location: files.resultPicture[0].path,
        name: files.resultPicture[0].originalname,
        type: files.resultPicture[0].mimetype,
        size: files.resultPicture[0].size,
        url:  `${BACKEND_URL}${resultPicturePath}`,
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
      isApproved = false;
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
    election.resultsCount += 1; 
    await election.save();

    // Convert electionType and stateName to Title Case for notifications
    const toTitleCase = (text) => {
      return text
        .split("-")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    };

    const formattedElectionName = toTitleCase(
      election.electionName || "Election"
    );
    const formattedStateName = toTitleCase(user.state || "State");

    // Determine body and info based on election type
    let uploadNotificationBody = "";
    let uploadNotificationInfo = "";

    switch (election.electionType) {
      case "national":
        uploadNotificationBody = `Result uploaded for ${formattedStateName} State`;
        uploadNotificationInfo = `${formattedElectionName} Election`;
        break;

      case "senatorial":
      case "gubernatorial":
      case "house-of-representatives":
      case "house-of-assembly":
        const formattedLGAName = toTitleCase(user.lga || "LGA");
        uploadNotificationBody = `Result uploaded for ${formattedLGAName} LGA`;
        uploadNotificationInfo = `${formattedStateName} State ${formattedElectionName} Election`;
        break;

      case "lga":
        const formattedWardName = toTitleCase(user.ward || "Ward");
        uploadNotificationBody = `Result uploaded for ${formattedWardName} Ward`;
        uploadNotificationInfo = `${formattedStateName} State ${formattedElectionName} Election`;
        break;

      default:
        uploadNotificationBody = `Result uploaded for ${formattedElectionName} Election`;
        uploadNotificationInfo = `${formattedElectionName} Election`;
    }

    // Create the upload notification
    const uploadNotification = new Notification({
      type: "result-upload",
      body: uploadNotificationBody,
      info: uploadNotificationInfo,
    });

    await uploadNotification.save();

    // Create or update pending approval notification
    const pendingCount = await ElectionData.countDocuments({
      election: electionId,
      isApproved: false,
    });

    let pendingNotificationBody = "";
    let pendingNotificationInfo = "";

    switch (election.electionType) {
      case "national":
        pendingNotificationBody = `${pendingCount} Pending Approval for ${formattedStateName} State`;
        pendingNotificationInfo = `${formattedElectionName} Election`;
        break;

      case "senatorial":
      case "gubernatorial":
      case "house-of-representatives":
      case "house-of-assembly":
        const formattedLGANameForPending = toTitleCase(user.lga || "LGA");
        pendingNotificationBody = `${pendingCount} Pending Approval for ${formattedLGANameForPending} LGA`;
        pendingNotificationInfo = `${formattedStateName} State ${formattedElectionName} Election`;
        break;

      case "lga":
        const formattedWardNameForPending = toTitleCase(user.ward || "Ward");
        pendingNotificationBody = `${pendingCount} Pending Approval for ${formattedWardNameForPending} Ward`;
        pendingNotificationInfo = `${formattedStateName} State ${formattedElectionName} Election`;
        break;

      default:
        pendingNotificationBody = `${pendingCount} Pending Approval for ${formattedElectionName}`;
        pendingNotificationInfo = `${formattedElectionName} Election`;
    }

    // Save pending approval notification
    const pendingNotification = new Notification({
      type: "pending-approval",
      body: pendingNotificationBody,
      info: pendingNotificationInfo,
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

export const deleteElectionResultDataService = async (electionId, userId) => {
  try {
    // Find the user by ID
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Find the result data and ensure it belongs to the requesting user
    const result = await ElectionData.findOneAndDelete({
      election: electionId,
      user: userId,
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
       const incidentReportFilePath = `/incidentreport/${path.basename(file.path)}`;
      return {
        location: file.path,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: `${BACKEND_URL}${incidentReportFilePath}`,
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

    // Check user existence
    const user = await CompletedUser.findById(userId);
    if (!user) throw new Error("User not found");

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

    const incidentVideos = files["incidentVideos[]"];
    const incidentPictures = files["incidentPictures[]"];

    console.log(incidentVideos, incidentPictures);
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

export const deleteIncidentReportDataService = async (electionId, userId) => {
  try {
    // Find the user by ID
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find the incident report and ensure it belongs to the requesting user
    const incidentReport = await IncidentReport.findOneAndDelete({
      election: electionId,
      user: userId,
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

export const getResultsAndPerformAction = async (userId, actionData) => {
  // Fetch user to get polling unit
  const user = await CompletedUser.findById(userId).lean();
  if (!user || !user.pollingUnit) {
    throw new Error("User not found or polling unit is missing");
  }

  const pollingUnit = user.pollingUnit;

  // If no actionData is provided, skip action handling and just return results
  if (!actionData) {
    return await fetchResults(pollingUnit, userId);
  }

  // Determine the data model based on the actionData type
  let dataModel;
  if (actionData.dataType === "election") {
    dataModel = ElectionData;
  } else if (actionData.dataType === "incident") {
    dataModel = IncidentReport;
  } else {
    throw new Error("Invalid data type. It must be 'election' or 'incident'.");
  }

  // Fetch the specific election result or incident report
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

  // Locate the user's existing action
  const existingActionIndex = data.actions.findIndex(
    (a) => a.userId.toString() === userId.toString()
  );
  const existingAction = data.actions[existingActionIndex];

  // Process action based on actionData
  if (existingAction) {
    if (actionData.action === "agree") {
      // Toggle agree: if already agreed, remove action; otherwise, set to agree
      if (existingAction.action === "agree") {
        data.actions.splice(existingActionIndex, 1); // Remove the action
      } else if (existingAction.action !== "flag") {
        existingAction.action = "agree"; // Set to agree if not flagged
      } else {
        throw new Error("You cannot agree after flagging the result.");
      }
    } else if (actionData.action === "flag") {
      if (!actionData.flagReason) {
        throw new Error("Flag reason is required when flagging.");
      }
      existingAction.action = "flag";
      existingAction.flagReason = actionData.flagReason;
    } else if (actionData.action === "unagree") {
      if (existingAction.action === "agree") {
        data.actions.splice(existingActionIndex, 1); // Remove agree action
      } else {
        throw new Error("You haven't agreed to this result/report.");
      }
    }
  } else {
    // Add a new action
    const newAction = { userId, action: actionData.action };
    if (actionData.action === "flag") {
      if (!actionData.flagReason) {
        throw new Error("Flag reason is required when flagging.");
      }
      newAction.flagReason = actionData.flagReason;
    }
    data.actions.push(newAction);
  }

  // Save the updated election result or incident report
  await data.save();

  // Fetch and return the updated results and reports
  return await fetchResults(pollingUnit, userId);
};

// Helper function to fetch results and reports for a polling unit and specific user
const fetchResults = async (pollingUnit, userId) => {
  const electionResults = await ElectionData.find({ pollingUnit })
    .populate({
      path: "election",
      select: "electionType electionName electionLocation startDate endDate",
    })
    .lean();

  const incidentReports = await IncidentReport.find({ pollingUnit })
    .populate({
      path: "election",
      select: "electionType electionName electionLocation startDate endDate",
    })
    .lean();

    
  // Prepare election result data for response
  const resultData = electionResults.map((result) => {
    const userAction = result.actions.find(
      (a) => a.userId.toString() === userId.toString()
    );
    return {
      electionTypeId: result.election._id,
      electionId: result._id,
      electionType: result.election.electionType,
      pollingUnit: result.pollingUnit,
      electionYear: moment(result.election.startDate).format("YYYY"),
      uploadedAt: result.createdAt,
      partiesVotes: result.partiesVotes,
      voteRating: result.voteRating,
      voterIntimidation: result.voterIntimidation,
      voteBuying: result.voteBuying,
      resultPicture: result.resultPicture,
      resultVideo: result.resultVideo,
      agreed: userAction ? userAction.action === "agree" : false,
      flagged: userAction ? userAction.action === "flag" : false,
      actions: result.actions,
      timeBegan: result.timeBegan,
      isApproved: result.isApproved,
      election: result.election,
    };
  });

  // Prepare incident report data for response
  const reportData = incidentReports.map((report) => {
    const userAction = report.actions.find(
      (a) => a.userId.toString() === userId.toString()
    );
    return {
      electionTypeId: report.election._id,
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
      agreed: userAction ? userAction.action === "agree" : false,
      flagged: userAction ? userAction.action === "flag" : false,
      actions: report.actions,
      election: report.election,
    };
  });

  return {
    results: resultData,
    incidentReports: reportData,
  };
};


export const checkUserSubmissionStatusForFlag = async (userId, actionData) => {
  const { electionId, action } = actionData;

  // Validate that action is "flag"
  if (action !== "flag") {
    throw new Error("Action must be 'flag' to check submission status.");
  }

  // Check if the user has submitted either an election result or an incident report for the specified election
  const electionSubmission = await ElectionData.findOne({
    user: userId,
    election: electionId,
  }).lean();

  const incidentSubmission = await IncidentReport.findOne({
    user: userId,
    election: electionId,
  }).lean();

  // Return true if a submission exists in either collection, otherwise false
  return Boolean(electionSubmission || incidentSubmission);
};

