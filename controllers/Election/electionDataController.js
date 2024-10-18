import {
  uploadResultDataService,
  getUserElectionData,
  updateResultDataService,
  deleteElectionResultDataService,
  createElectionService,
  getAllElectionResults,
  getElectionResultById,
  getElectionById,
  updateElectionService,
  uploadIncidentReportDataService,
  updateIncidentReportDataService,
  getAllElectionsService,
  deleteIncidentReportDataService,
  getLiveElectionById,
  getUserElectionResultsAndReports,
  getResultsAndPerformAction,
} from "../../services/Election/electionService.js";
import CompletedUser from "../../models/CompletedUser.js";
import Election from "../../models/Election/Election.js";

export const createElection = async (req, res) => {
  try {
    const election = await createElectionService(req.body);
    res.status(201).json(election);
  } catch (error) {
   if (error.statusCode) {
     res.status(error.statusCode).json({ message: error.message });
   } else {
     res
       .status(500)
       .json({ message: "Error creating election", error: error.message });
   }
  }
};

export const updateElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const updatedElection = await updateElectionService(electionId, req.body);
    res.status(200).json(updatedElection);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating election", error: error.message });
  }
};

export const getAllElections = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log("Fetching elections for user:", userId);

    const elections = await getAllElectionsService(userId);

    // if (elections.length === 0) {
    //   console.log("No relevant elections found for user.");
    // } else {
    //   console.log(`Found ${elections.length} elections for the user.`);
    // }

    res.status(200).json({ elections });
  } catch (error) {
    console.error("Error fetching elections:", error);
    res
      .status(500)
      .json({ message: "Error fetching elections", error: error.message });
  }
};


export const getElectionResultByIdCont = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user._id;
    const result = await getElectionResultById(electionId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching election", error });
  }
};

export const getElectionByIdCont = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user._id;
    const election = await getElectionById(electionId, userId);
    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ message: "Error fetching election details", error });
  }
};

export const getLiveElectionByIdCont = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await getLiveElectionById(electionId,);
    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ message: "Error fetching live election details", error });
  }
};

export const uploadResultData = async (req, res) => {
  try {
    //  console.log("Body received:", req.body);
    //  console.log("Files received:", req.files);

    const { electionId } = req.params;
    const userId = req.user._id;
    const resultData = await uploadResultDataService(
      electionId,
      userId,
      req.body,
      req.files
    );
    res.status(201).json(resultData);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error uploading result data",
      error: error.message,
    });
  }
};


export const updateResultData = async (req, res) => {
  //  console.log("Body received:", req.body);
  //  console.log("Files received:", req.files);
 try {
   const { electionId } = req.params;
   const userId = req.user._id;
   const updatedResultData = await updateResultDataService(
     electionId,
     userId,
     req.body,
     req.files
   );
   res.status(200).json(updatedResultData);
 } catch (error) {
   res
     .status(500)
     .json({ message: "Error updating result data", error: error.message });
 }
};

export const getAllElectionResultsController = async (req, res) => {
   try {
     const allResults = await getAllElectionResults();
     res.status(200).json(allResults);
   } catch (error) {
     res.status(500).json({
       message: "Error fetching all election results",
       error: error.message,
     });
   }
};


export const uploadIncidentReportData = async (req, res) => {
  // console.log("Body received:", req.body);
  // console.log("Files received:", req.files);
  try {
    const { electionId } = req.params;
    const report = await uploadIncidentReportDataService(
      electionId,
      req.user._id,
      req.body,
      req.files
    );
    res.status(201).json(report);
  } catch (error) {
    console.error("Error uploading incident report data", error);
    res.status(500).json({
      message: "Error uploading incident report data",
      error: error.message,
    });
  }
};

export const updateIncidentReportData = async (req, res) => {
  console.log("Body received:", req.body);
  console.log("Files received:", req.files);
  try {
    const { electionId } = req.params;
    const userId = req.user._id;

    const report = await updateIncidentReportDataService(
      electionId,
      userId,
      req.body,
      req.files
    );

    res.status(200).json(report);
  } catch (error) {
    console.error("Error updating incident report data", error);
    res.status(500).json({
      message: "Error updating incident report data",
      error: error.message,
    });
  }
};


export const getUserElectionDataController = async (req, res) => {
  try {
    const userId = req.user._id;
    const electionData = await getUserElectionData(userId);
    res.status(200).json(electionData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching election data", error });
  }
};

export const deleteElectionResultData = async (req, res) => {
  try {
    const { electionId } = req.params;
    const response = await deleteElectionResultDataService(electionId);
    res.status(200).json(response);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting result data", error: error.message });
  }
};

export const deleteIncidentReportData = async (req, res) => {
  try {
    const { electionId } = req.params;
    const response = await deleteIncidentReportDataService(electionId);
    res.status(200).json(response);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Error deleting incident report data",
        error: error.message,
      });
  }
};

export const getUserElectionResultsAndReportsCon = async (req, res) => {
  try {
    const userId = req.user._id;

    const { data } = await getUserElectionResultsAndReports(userId);

    res.status(200).json({
      message: "Election results and incident reports fetched successfully",
      data,
    });
  } catch (error) {
    console.error(`Error fetching user election data: ${error.message}`);
    res.status(500).json({
      message: "Failed to fetch election results and incident reports",
      error: error.message,
    });
  }
};
//   try {
//     const userId = req.user._id;
//     const { electionId, action, dataType } = req.body;

//     const results = await getResultsAndPerformAction(userId, {
//       electionId,
//       action,
//       dataType,
//     });

//     return res.status(200).json({
//       message: "Election results and incident reports fetched successfully",
//       results,
//     });
//   } catch (error) {
//     console.error(
//       "Error fetching election results and performing action:",
//       error
//     );
//     return res.status(500).json({
//       message: "Failed to fetch election results or perform action",
//       error: error.message,
//     });
//   }
// };

export const getResultsAndPerformActionController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { electionId, action, dataType, flagReason } = req.body;

    // Check if flagReason is provided when action is "flag"
    if (action === "flag" && !flagReason) {
      return res.status(400).json({ message: "Flag reason is required." });
    }

    // Call the service, passing action data
    const results = await getResultsAndPerformAction(userId, {
      electionId,
      action,
      dataType,
      flagReason, 
    });

    return res.status(200).json({
      message: action
        ? "Election results and incident reports updated successfully"
        : "Fetched election results and incident reports",
      results,
    });
  } catch (error) {
    console.error(
      "Error fetching election results and performing action:",
      error
    );
    return res.status(500).json({
      message: "Failed to fetch election results or perform action",
      error: error.message,
    });
  }
};


// Controller to fetch live election results
// export const getLiveElectionResults = async (req, res) => {
//   const { electionId } = req.params;
//   const userId = req.user._id; // Assuming userId is in the token payload

//   try {
//     // Fetch the user details based on their userId (to get their location information)
//     const user = await CompletedUser.findById(userId).lean();
//     if (!user) throw new Error("User not found");

//     // Fetch the election details based on the electionId
//     const election = await Election.findById(electionId).lean();
//     if (!election) throw new Error("Election not found");

//     let resultData;
//     switch (election.electionType) {
//       case "national":
//         resultData = await getNationalResults(electionId);
//         break;
//       case "senatorial":
//         resultData = await getSenatorialResults(electionId, user);
//         break;
//       case "house-of-representatives":
//         resultData = await getHouseOfRepsResults(electionId, user);
//         break;
//       case "house-of-assembly":
//         resultData = await getHouseOfAssemblyResults(electionId, user);
//         break;
//       case "gubernatorial":
//         resultData = await getGubernatorialResults(electionId, user);
//         break;
//       case "lga":
//         resultData = await getLocalGovernmentResults(electionId, user);
//         break;
//       default:
//         throw new Error("Invalid election type");
//     }

//     return res.status(200).json(resultData);
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error fetching live election results",
//       error: error.message,
//     });
//   }
// };

// export const getLiveIncidentReport = async (req, res) => {
//   const { electionId } = req.params;
//   const userId = req.user._id; 
//   try {
//     // Fetch the user details based on their userId (to get their location information)
//     const user = await CompletedUser.findById(userId).lean();
//     if (!user) throw new Error("User not found");

//     // Fetch the election details based on the electionId
//     const election = await Election.findById(electionId).lean();
//     if (!election) throw new Error("Election not found");

//     let resultData;

//     // Determine the election type and fetch the appropriate incident report data
//     switch (election.electionType) {
//       case "national":
//         resultData = await getNationalIncidentReports(electionId);
//         break;
//       case "senatorial":
//         resultData = await getSenatorialIncidentReports(electionId, user);
//         break;
//       case "house-of-representatives":
//         resultData = await getHouseOfRepsIncidentReports(electionId, user);
//         break;
//       case "gubernatorial":
//         resultData = await getGubernatorialIncidentReports(electionId, user);
//         break;
//       case "house-of-assembly":
//         resultData = await getHouseOfAssIncidentReports(electionId, user);
//         break;
//       case "lga":
//         resultData = await getLocalGovernmentIncidentReports(electionId, user);
//         break;
//       default:
//         throw new Error("Invalid election type");
//     }

//     // Return the incident report data
//     return res.status(200).json(resultData);
//   } catch (error) {
//     console.error("Error fetching live incident reports:", error);
//     return res.status(500).json({
//       message: "Error fetching live incident reports",
//       error: error.message,
//     });
//   }
// };

// // Controller to handle sentiment analysis request
// export const getSentimentAnalysis = async (req, res) => {
//   const { electionId } = req.params;
//   const userId = req.user._id;

//   try {
//     // Fetch user details (to determine the groupBy field)
//     const user = await CompletedUser.findById(userId).lean();
//     if (!user) throw new Error("User not found");

//     // Fetch election details to determine grouping (state, lga, ward)
//     const election = await Election.findById(electionId).lean();
//     if (!election) throw new Error("Election not found");

//     let groupBy = "lga";
//     switch (election.electionType) {
//       case "national":
//         groupBy = "state";
//         break;
//       case "senatorial":
//       case "house-of-representatives":
//       case "house-of-assembly":
//       case "gubernatorial":
//       case "lga":
//         groupBy = "ward";
//         break;
//       default:
//         groupBy = "lga";
//     }

//     // Call the sentiment analysis service
//     const sentimentAnalysis = await getSentimentAnalysisService(electionId, groupBy);

//     return res.status(200).json({
//       electionDetails: {
//         electionType: election.electionType,
//         electionName: election.electionName,
//         startDate: election.startDate,
//         endDate: election.endDate,
//       },
//       sentimentAnalysis,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error fetching sentiment analysis",
//       error: error.message,
//     });
//   }
// };


