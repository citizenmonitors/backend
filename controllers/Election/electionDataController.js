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
  getAllActiveElectionsService,
  deleteIncidentReportDataService,
  getLiveElectionById,
  getUserElectionResultsAndReports,
  getResultsAndPerformAction,
  checkUserSubmissionStatusForFlag,
  activeElections,
  updateActiveElections,
  getAllElectionTypesService,
} from "../../services/Election/electionService.js";
import { createEventService } from "../../services/adminService/adminElectionService.js";

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

export const createActiveElectionsCon = async (req, res) => {
  try {
    const activeElection = await activeElections(req.body);
    res.status(201).json(activeElection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateActiveElectionCon = async (req, res) => {
  try {
    
    const { electionId } = req.params;
    const updatedElection = await updateActiveElections(electionId, req.body);
    res.status(200).json(updatedElection);
  } catch (error) {
    res.status(500).json({ message:"Error updating election", error: error.message });
  }
}

export const getAllActiveElections = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log("Fetching elections for user:", userId);

    const elections = await getAllActiveElectionsService(userId);

    res.status(200).json(elections );
  } catch (error) {
    console.error("Error fetching elections:", error);
    res
      .status(500)
      .json({ message: "Error fetching elections", error: error.message });
  }
};
export const getAllElectionTypes = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log("Fetching elections for user:", userId);

    const elections = await getAllElectionTypesService(userId);

    res.status(200).json(elections );
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
    const userId = req.user._id; 

    const response = await deleteElectionResultDataService(electionId, userId);
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
    const userId = req.user._id;
    const response = await deleteIncidentReportDataService(electionId, userId);
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

export const getResultsAndPerformActionController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { electionId, action, dataType, flagReason } = req.body;

    const actionData = action
      ? { electionId, action, dataType, flagReason }
      : null;

    const results = await getResultsAndPerformAction(userId, actionData);

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


export const checkUserStatusForFlagController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { electionId, action, dataType } = req.body;

    // Validate required fields
    if (!electionId || !action || !dataType) {
      return res.status(400).json({
        message: "Election ID, action, and data type are required.",
      });
    }

    // Call the service to check submission status
    const isUploaded = await checkUserSubmissionStatusForFlag(userId, {
      electionId,
      action,
      dataType,
    });

    // Respond with the submission status
    return res.status(200).json({ isUploaded });
  } catch (error) {
    console.error("Error checking user submission status for flag:", error);
    return res.status(500).json({
      message: "Failed to check submission status",
      error: error.message,
    });
  }
};



export const createEventController = async (req, res) => {
  try {
    const event = await createEventService(req.body);
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};