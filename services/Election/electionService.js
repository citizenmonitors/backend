import Election from "../../models/Election/Election.js";
import ElectionData from "../../models/Election/ElectionData.js";
import ActiveElection from "../../models/Election/ActiveElection.js";
import CompletedUser from "../../models/CompletedUser.js";
import { politicalParties } from "../../models/Election/PoliticalParty.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import Notification from "../../models/DailyTraffic/Notification.js";
// import { uploadFilesToGCS } from "../GoogleCloud/gcsService.js";
import File from "../../models/file.js";
import path from "path";
import moment from "moment";

const BACKEND_URL = process.env.BACKEND_URL;

export const createElectionService = async (data) => {
  const { electionType, electionName } = data;

  const existingElection = await Election.findOne({
    electionType,
    electionName,
  });
  if (existingElection) {
    throw new Error("Election already exists");
  }

  const election = new Election({ electionType, electionName });
  return await election.save();
};

export const updateElectionService = async (electionId, data) => {
  const updatedElection = await Election.findByIdAndUpdate(electionId, data, {
    new: true,
  });
  if (!updatedElection) {
    throw new Error("Election not found");
  }
  return updatedElection;
};

export const activeElections = async (data) => {
  let { electionId, electionLocation, startDate, endDate } = data;

  const existingElection = await Election.findById(electionId);
  if (!existingElection) {
    throw new Error("Election not found");
  }

  if (
    ["national", "house-of-representatives", "senatorial"].includes(
      existingElection.electionType
    )
  ) {
    electionLocation = null;
  } else if (
    ["gubernatorial", "house-of-assembly"].includes(
      existingElection.electionType
    )
  ) {
    if (!electionLocation) {
      throw new Error("State election requires a valid state name.");
    }
  } else if (["LGA"].includes(existingElection.electionType)) {
    if (!electionLocation) {
      throw new Error("LGA election requires a valid LGA name.");
    }
  }

  const duplicateElection = await ActiveElection.findOne({
    electionLocation,
    startDate,
    endDate,
  });

  if (duplicateElection) {
    throw new Error(
      "An election for this location and date range already exists."
    );
  }

  // Create new active election
  const activeElection = new ActiveElection({
    election: electionId,
    electionLocation,
    startDate,
    endDate,
  });

  const savedElection = await activeElection.save();

  const {
    results,
    resultsCount,
    incidentReports,
    politicalParties,
    ...electionData
  } = savedElection.toObject();

  return electionData;
};

export const updateActiveElections = async (electionId, data) => {
  try {
    const updateElection = await ActiveElection.findByIdAndUpdate(
      electionId,
      data,
      {
        new: true,
      }
    ).lean();

    if (!updateElection) {
      throw new Error("Election not found");
    }

    // Remove unnecessary fields before returning
    const {
      results,
      resultsCount,
      incidentReports,
      politicalParties,
      ...electionData
    } = updateElection;

    return electionData;
  } catch (error) {
    throw new Error(`Failed to update election: ${error.message}`);
  }
};

export const getAllActiveElectionsService = async (userId) => {
  const standardizeName = (name) =>
    name.toLowerCase().replace(/[-\s]/g, "_").trim();

  const user = await CompletedUser.findById(userId).lean();
  if (!user) throw new Error("User not found");

  console.log(`Fetching elections for user: ${userId}`);
  const userState = standardizeName(user.state);
  const userLGA = standardizeName(user.lga);

  // Fetch all active elections with election details
  const activeElections = await ActiveElection.find()
    .populate("election", "electionType electionName")
    .populate("results incidentReports")
    .lean();

  const relevantElections = activeElections.filter(
    ({ election, electionLocation }) => {
      if (!election) return false;

      const electionType = election.electionType.toLowerCase();
      electionLocation = electionLocation?.toLowerCase();

      if (
        ["national", "house-of-representatives", "senatorial"].includes(
          electionType
        )
      )
        return true;
      if (["gubernatorial", "house-of-assembly"].includes(electionType))
        return electionLocation === userState;
      if (["lga"].includes(electionType)) return electionLocation === userLGA;
      return false;
    }
  );

  if (relevantElections.length === 0) {
    console.log("No relevant elections found for user.");
    return { elections: [] };
  }
  console.log(relevantElections.map((a) => a.results), userId);
  // 67913cb1e560c2fb43cf68af

  return {
    elections: relevantElections.map(
      ({ election, results, incidentReports, ...electionData }) => ({
        electionType: election.electionType,
        electionName: election.electionName,
        ...electionData,
        results:
          results
            ?.filter(({ user }) => user.toString() === userId.toString())
            .map(({ _id }) => _id) || [],
        incidentReports:
          incidentReports
            ?.filter(({ user }) => user.toString() === userId.toString())
            .map(({ _id }) => _id) || [],
      })
    ),
  };
};




export const getAllElectionTypesService = async (userId) => {
  try {
    const standardizeName = (name) =>
      name?.toLowerCase().replace(/[-\s]/g, "_").trim();

    const user = await CompletedUser.findById(userId).lean();
    if (!user) throw new Error("User not found");

    console.log(`Fetching elections for user: ${userId}`);

    const userState = standardizeName(user.state);
    const userLGA = standardizeName(user.lga);

    // Fetch all elections safely
    const elections = await Election.find()
      .select("electionType electionName")
      .lean();

    if (!elections || elections.length === 0) {
      console.log("No elections found.");
      return { elections: [] };
    }

    // Filter elections safely
    const relevantElections = elections.filter((election) => {
      if (!election || !election.electionType) return false;

      const electionType = election.electionType.toLowerCase();

      if (
        ["national", "house-of-representatives", "senatorial"].includes(
          electionType
        )
      ) {
        return true;
      }
      if (["gubernatorial", "house-of-assembly"].includes(electionType)) {
        return userState && userState.length > 0;
      }
      if (["lga"].includes(electionType)) {
        return userLGA && userLGA.length > 0;
      }
      return false;
    });

    console.log("Filtered Elections:", relevantElections);

    return { elections: relevantElections };
  } catch (error) {
    console.error("Error fetching elections:", error);
    return { message: "Error fetching elections", error: error.message };
  }
};

export const getElectionResultById = async (electionId, userId) => {
  const activeElection = await ActiveElection.findById(electionId).lean();
  if (!activeElection) {
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
    return { election: activeElection, result, incidentReport };
  }
};

export const getElectionById = async (electionId, userId) => {
  try {
    // Fetch the election data by ID
    const activeElection = await ActiveElection.findById(electionId)
      .populate("election", "electionType electionName")
      .lean();
    if (!activeElection) {
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
    const { election, ...electionData } = activeElection;

    // Include only required data and format political parties properly
    const formattedElectionData = {
      ...electionData,
      electionType: election.electionType,
      electionName: election.electionName,
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

    const activeElection = await ActiveElection.findOne({
      election: electionId,
    }).lean();
    if (!activeElection) throw new Error("Active Election not found");

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
        electionname: election.electionName,
        startdate: activeElection.startDate,
        enddate: activeElection.endDate,
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
      rejectedPapers,
      spoiledBallotPapers,
      usedBallotPapers,
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

    // Convert accreditedVoters and rejectedPapers to numbers
    accreditedVoters = Number(accreditedVoters);
    rejectedPapers = Number(rejectedPapers);
    spoiledBallotPapers = Number(spoiledBallotPapers);
    usedBallotPapers = Number(usedBallotPapers);

    if (
      isNaN(accreditedVoters) ||
      isNaN(rejectedPapers) ||
      isNaN(spoiledBallotPapers) ||
      isNaN(usedBallotPapers)
    ) {
      throw new Error(
        "accreditedVoters, rejectedPapers, spoiledBallotPapers, and usedBallotPapers must be valid numbers."
      );
    }

    // Find the election by its ID
    const activeElection = await ActiveElection.findById(electionId).populate(
      "election",
      "electionType electionName"
    );
    if (!activeElection) {
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

    if (
      spoiledBallotPapers + rejectedPapers + totalVotes !==
      usedBallotPapers
    ) {
      throw new Error(
        "The total of spoiledBallotPapers, rejectedPapers, and totalValidVotes must equal usedBallotPapers."
      );
    }

    // Validate that accreditedVoters is greater than or equal to usedBallotPapers
    if (accreditedVoters < usedBallotPapers) {
      throw new Error(
        "The number of accreditedVoters cannot be less than the total number of used ballot papers."
      );
    }

    // Initialize result picture and video
    let resultPicture = null;
    let resultVideo = null;

    // Handle the picture file upload (if provided)
    if (files.resultPicture && files.resultPicture.length > 0) {
      const resultPicturePath = `/resultpicture/${path.basename(
        files.resultPicture[0].path
      )}`;

      resultPicture = await File.create({
        location: files.resultPicture[0].path,
        name: files.resultPicture[0].originalname,
        type: files.resultPicture[0].mimetype,
        size: files.resultPicture[0].size,
        url: `${BACKEND_URL}${resultPicturePath}`,
      });
    }

    // Handle the video file upload
    if (files.resultVideo && files.resultVideo.length > 0) {
      const resultVideoPath = `/resultvideo/${path.basename(
        files.resultVideo[0].path
      )}`;
      resultVideo = await File.create({
        location: files.resultVideo[0].path,
        name: files.resultVideo[0].originalname,
        type: files.resultVideo[0].mimetype,
        size: files.resultVideo[0].size,
        url: `${BACKEND_URL}${resultVideoPath}`,
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
      rejectedPapers,
      spoiledBallotPapers,
      usedBallotPapers,
      ...(isApproved !== null && { isApproved }),
    });

    // Save the election result data
    const savedResultData = await electionData.save();

    // Update the election document with the new result
    activeElection.results.push(savedResultData);
    activeElection.resultsCount += 1;
    await activeElection.save();

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
      activeElection.election.electionName || "Election"
    );
    const formattedStateName = toTitleCase(user.state || "State");

    // Determine body and info based on election type
    let uploadNotificationBody = "";
    let uploadNotificationInfo = "";

    switch (activeElection.election.electionType) {
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

    switch (activeElection.election.electionType) {
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
      rejectedPapers,
      spoiledBallotPapers,
      usedBallotPapers,
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

    // Convert inputs to numbers if provided
    accreditedVoters =
      accreditedVoters !== undefined ? Number(accreditedVoters) : undefined;
    rejectedPapers =
      rejectedPapers !== undefined ? Number(rejectedPapers) : undefined;
    spoiledBallotPapers =
      spoiledBallotPapers !== undefined
        ? Number(spoiledBallotPapers)
        : undefined;
    usedBallotPapers =
      usedBallotPapers !== undefined ? Number(usedBallotPapers) : undefined;

    // Check if the election exists
    const electionExists = await ActiveElection.findById(electionId);
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

    // Validate new logic for ballot papers and votes
    if (
      partiesVotes ||
      rejectedPapers ||
      spoiledBallotPapers ||
      usedBallotPapers ||
      accreditedVoters
    ) {
      const totalVotes = partiesVotes
        ? partiesVotes.reduce(
            (sum, partyVote) => sum + Number(partyVote.count),
            0
          )
        : result.partiesVotes.reduce(
            (sum, partyVote) => sum + Number(partyVote.count),
            0
          );

      const validatedRejectedPapers =
        rejectedPapers !== undefined ? rejectedPapers : result.rejectedPapers;
      const validatedSpoiledBallotPapers =
        spoiledBallotPapers !== undefined
          ? spoiledBallotPapers
          : result.spoiledBallotPapers;
      const validatedUsedBallotPapers =
        usedBallotPapers !== undefined
          ? usedBallotPapers
          : result.usedBallotPapers;
      const validatedAccreditedVoters =
        accreditedVoters !== undefined
          ? accreditedVoters
          : result.accreditedVoters;

      // Validate that usedBallotPapers equals spoiled + rejected + totalValidVotes
      if (
        validatedSpoiledBallotPapers + validatedRejectedPapers + totalVotes !==
        validatedUsedBallotPapers
      ) {
        throw new Error(
          "The total of spoiledBallotPapers, rejectedPapers, and totalValidVotes must equal usedBallotPapers."
        );
      }

      // Validate that accreditedVoters is greater than or equal to usedBallotPapers
      if (validatedAccreditedVoters < validatedUsedBallotPapers) {
        throw new Error(
          "The number of accreditedVoters cannot be less than the total number of used ballot papers."
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
    result.rejectedPapers =
      rejectedPapers !== undefined ? rejectedPapers : result.rejectedPapers;
    result.spoiledBallotPapers =
      spoiledBallotPapers !== undefined
        ? spoiledBallotPapers
        : result.spoiledBallotPapers;
    result.usedBallotPapers =
      usedBallotPapers !== undefined
        ? usedBallotPapers
        : result.usedBallotPapers;

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
    await ActiveElection.findByIdAndUpdate(electionId, {
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
    const activeElections = await ActiveElection.find()
      .populate("election", "electionType electionName")
      .lean();
    if (!activeElections || activeElections.length === 0) {
      throw new Error("No elections found");
    }

    const allResults = {};

    for (const election of activeElections) {
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
            electionType: activeElections.election.electionType,
            electionName: activeElections.election.electionName,
            // startDate: activeElections.electionLocation.startDate,
            // endDate: activeElections.electionLocation.endDate,
          },
          results: [],
          incidents: aggregateIncidents(incidents) || [],
        };
        continue;
      }

      const aggregatedResults = aggregateResults(results);
      allResults[election._id] = {
        electionDetails: {
          electionType: activeElections.election.electionType,
          electionName: activeElections.election.electionName,
          // startDate: activeElections.electionLocation.startDate,
          // endDate: activeElections.electionLocation.endDate,
          resultsCount: activeElections.resultsCount,
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
    const activeElection = await ActiveElection.findById(electionId);
    if (!activeElection) throw new Error("Election not found");

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
      const incidentReportFilePath = `/incidentreport/${path.basename(
        file.path
      )}`;
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
    activeElection.incidentReports.push(savedReport);
    await activeElection.save();

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
    const electionExists = await ActiveElection.findById(electionId);
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
    await ActiveElection.findByIdAndUpdate(electionId, {
      $pull: { incidentReports: incidentReport._id },
    });

    return { message: "Incident report deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete incident report data: ${error.message}`);
  }
};

export const getUserElectionResultsAndReports = async (userId) => {
  try {
    // const elections = await ActiveElection.find().populate("election", "electionType electionName")
    // Confirm that the user exists
    const user = await CompletedUser.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch election results by user
    const electionResults = await ElectionData.find({ user: userId })
      .populate({
        path: "election",
        select: "election startDate endDate createdAt updatedAt",
        populate: {
          path: "election",
          select: "electionType electionName",
        },
      })

      .lean();

    // Fetch incident reports by user
    const incidentReports = await IncidentReport.find({ user: userId })
      .populate({
        path: "election",
        select: "election startDate endDate createdAt updatedAt",
        populate: {
          path: "election",
          select: "electionType electionName",
        },
      })
      .lean();

    const formattedElectionResults = electionResults.map((result) => ({
      _id: result._id,
      ...result,
      election: {
        _id: result.election._id,
        electionType: result.election?.election?.electionType,
        electionName: result.election?.election?.electionName,
        startDate: result.election?.startDate,
        endDate: result.election?.endDate,
        createdAt: result.election?.createdAt,
        updatedAt: result.election?.updatedAt,
      },
    }));

    const formattedIncidentReports = incidentReports.map((incident) => ({
      _id: incident._id,
      ...incident,
      election: {
        _id: incident.election._id,
        electionType: incident.election?.election?.electionType,
        electionName: incident.election?.election?.electionName,
        startDate: incident.election?.startDate,
        endDate: incident.election?.endDate,
        createdAt: incident.election?.createdAt,
        updatedAt: incident.election?.updatedAt,
      },
    }));

    return {
      data: {
        electionResults: formattedElectionResults,
        incidentReports: formattedIncidentReports,
      },
    };
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
  try {
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
      throw new Error(
        "Invalid data type. It must be 'election' or 'incident'."
      );
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

    if (data.user.toString() === userId.toString()) {
      throw new Error("You cannot flag your own result or incident.");
    }

    // Ensure user has uploaded a result before flagging
    const hasUploaded = await checkUserSubmissionStatusForFlag(
      userId,
      actionData
    );
    if (!hasUploaded) {
      throw new Error("You must have submitted a result/incident to flag one.");
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
          data.actions.splice(existingActionIndex, 1);
        } else if (existingAction.action !== "flag") {
          existingAction.action = "agree";
        } else {
          throw new Error("You cannot agree after flagging the result.");
        }
      } else if (actionData.action === "flag") {
        if (!actionData.flagReason) {
          throw new Error("Flag reason is required when flagging.");
        }
        if (!actionData.evidenceId) {
          throw new Error(
            "You must provide an evidenceId when flagging a result."
          );
        }
        existingAction.action = "flag";
        existingAction.flagReason = actionData.flagReason;
        existingAction.evidenceId = hasUploaded.evidenceId;
      } else if (actionData.action === "unagree") {
        if (existingAction.action === "agree") {
          data.actions.splice(existingActionIndex, 1);
        } else {
          throw new Error("You haven't agreed to this result/report.");
        }
      }
    } else {
      // Add a new action
      const newAction = {
        userId,
        action: actionData.action,
        evidenceId: hasUploaded.evidenceId,
      };
      if (actionData.action === "flag") {
        if (!actionData.flagReason) {
          throw new Error("Flag reason is required when flagging.");
        }
        newAction.flagReason = actionData.flagReason;
      }
      data.actions.push(newAction);
    }

    const totalUsersInPollingUnit = await CompletedUser.countDocuments({
      pollingUnit: user.pollingUnit,
    });

    const totalUsers =
      totalUsersInPollingUnit > 0 ? totalUsersInPollingUnit : 1;
    const flaggedCount = data.actions.filter((a) => a.action === "flag").length;
    const priorityLevel = Math.round((flaggedCount / totalUsers) * 100);
    if (flaggedCount > 0) {
      data.flagged = true;
      data.priorityLevel = priorityLevel;
    }
    if (priorityLevel >= 50) {
      data.hidden = true;
    }

    // Save the updated election result or incident report
    await data.save();

    // Fetch and return the updated results and reports
    return await fetchResults(pollingUnit, userId);
  } catch (error) {
    throw new Error(`Error processing action: ${error.message}`);
  }
};

// Helper function to fetch results and reports for a polling unit and specific user
const fetchResults = async (pollingUnit, userId) => {
  const electionResults = await ElectionData.find({
    pollingUnit,
    userRole: "observer",
    hidden: false,
  })
    .populate({
      path: "election",
      populate: {
        path: "election",
        select: "electionType electionName",
      },
      select: "startDate endDate electionLocation",
    })
    .lean();

  const incidentReports = await IncidentReport.find({
    pollingUnit,
    userRole: "observer",
    hidden: false,
  })
    .populate({
      path: "election",
      populate: {
        path: "election",
        select: "electionType electionName",
      },
      select: "startDate endDate electionLocation",
    })
    .lean();

  // Process election results
  const resultData = electionResults.map((result) => {
    const userAction = result.actions.find(
      (a) => a.userId.toString() === userId.toString()
    );

    return {
      electionTypeId: result.election._id,
      electionId: result._id,
      electionType: result.election?.election?.electionType,
      electionName: result.election?.election?.electionName,
      pollingUnit: result.pollingUnit,
      electionYear: result.election
        ? moment(result.election?.startDate).format("YYYY")
        : "N/A",
      uploadedAt: result.createdAt,
      partiesVotes: result.partiesVotes,
      voteRating: result.voteRating,
      voterIntimidation: result.voterIntimidation,
      voteBuying: result.voteBuying,
      resultPicture: result.resultPicture,
      resultVideo: result.resultVideo,
      agreed: userAction ? userAction.action === "agree" : false,
      flagged: userAction ? userAction.action === "flag" : false,
      hidden: result.hidden,
      priorityLevel: result.priorityLevel,
      actions: result.actions,
      timeBegan: result.timeBegan,
      isApproved: result.isApproved,
      election: result.election,
      electionLocation: result.election?.electionLocation,
      startDate: result.election?.startDate || null,
      endDate: result.election?.endDate || null,
    };
  });

  // Process incident reports
  const reportData = incidentReports.map((report) => {
    const userAction = report.actions.find(
      (a) => a.userId.toString() === userId.toString()
    );

    return {
      electionTypeId: report.election._id,
      electionId: report._id,
      electionType: report.election?.election?.electionType,
      electionName: report.election?.election?.electionName,
      electionYear: report.election
        ? moment(report.election.startDate).format("YYYY")
        : "N/A",
      pollingUnit: report.pollingUnit,
      uploadedAt: report.createdAt,
      selectIncident: report.selectIncident,
      incidentNote: report.incidentNote,
      electionRating: report.electionRating,
      incidentPictures: report.incidentPictures,
      incidentVideos: report.incidentVideos,
      agreed: userAction ? userAction.action === "agree" : false,
      flagged: userAction ? userAction.action === "flag" : false,
      hidden: report.hidden,
      priorityLevel: report.priorityLevel,
      actions: report.actions,
      electionLocation: report.election?.electionLocation,
      startDate: report.election?.startDate || null,
      endDate: report.election?.endDate || null,
      election: report.election,
    };
  });

  return {
    results: resultData,
    incidentReports: reportData,
  };
};

export const checkUserSubmissionStatusForFlag = async (userId, actionData) => {
  const { electionId, action, dataType } = actionData;

  // Validate that action is "flag" and dataType is either "election" or "incident"
  if (action !== "flag") {
    throw new Error("Action must be 'flag' to check submission status.");
  }
  if (!["election", "incident"].includes(dataType)) {
    throw new Error("Invalid data type. It must be 'election' or 'incident'.");
  }

  // Fetch the election ID for the main election from the provided dataType and electionId
  let mainElectionId;
  if (dataType === "election") {
    const electionResult = await ElectionData.findById(electionId).lean();
    if (!electionResult) {
      throw new Error("Election result not found.");
    }
    mainElectionId = electionResult.election;
  } else if (dataType === "incident") {
    const incidentReport = await IncidentReport.findById(electionId).lean();
    if (!incidentReport) {
      throw new Error("Incident report not found.");
    }
    mainElectionId = incidentReport.election;
  }

  // Check if the user has submitted either an election result or an incident report for the specific election
  const electionSubmission = await ElectionData.findOne({
    user: userId,
    election: mainElectionId,
  }).lean();

  const incidentSubmission = await IncidentReport.findOne({
    user: userId,
    election: mainElectionId,
  }).lean();

  // If user has a submission, return its ID as `evidenceId`
  if (electionSubmission) {
    return { hasUploaded: true, evidenceId: electionSubmission._id };
  } else if (incidentSubmission) {
    return { hasUploaded: true, evidenceId: incidentSubmission._id };
  }

  return { hasUploaded: false };
};



