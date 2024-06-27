import {
  uploadResultDataService,
  getUserElectionData,
  updateResultDataService,
  deleteUserElectionData,
  createElectionService,
  getAllElectionResults,
  getElectionResultById,
  getElectionById,
  updateElectionService,
  uploadIncidentReportDataService,
  updateIncidentReportDataService,
  getAllElectionsService,
} from "../../services/Election/electionService.js";

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
    const elections = await getAllElectionsService();
    res.status(200).json({ elections });
  } catch (error) {
    res.status(500).json({ message: "Error fetching elections", error });
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
    const election = await getElectionById(electionId);
    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ message: "Error fetching election details", error });
  }
};

export const uploadResultData = async (req, res) => {
  try {
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
    res
      .status(500)
      .json({ message: "Error uploading result data", error: error.message });
  }
};

export const updateResultData = async (req, res) => {
 try {
   const { electionId } = req.params;
   const userId = req.user._id;
   const data = req.body;
   const files = req.files;


   if (!electionId) {
     console.error("electionId is undefined");
     return res.status(400).json({ message: "Invalid electionId" });
   }

   const updatedResult = await updateResultDataService(
     electionId,
     userId,
     data,
     files
   );
   res.status(200).json(updatedResult);
 } catch (error) {
   console.error(error);
   res
     .status(500)
     .json({ message: "Error updating result data", error: error.message });
 }
};


export const getAllElectionResultsController = async (req, res) => {
  try {
    const results = await getAllElectionResults();
    res.status(200).json(results);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching all election results",
        error: error.message,
      });
  }
};


export const uploadIncidentReportData = async (req, res) => {
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
    res
      .status(500)
      .json({ message: "Error uploading incident report data", error });
  }
};
export const updateIncidentReportData = async (req, res) => {
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
    res
      .status(500)
      .json({
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

export const deleteUserElectionDataController = async (req, res) => {
  try {
    const { dataId } = req.params;
    const userId = req.user._id;
    await deleteUserElectionData(dataId, userId);
    res.status(200).json({ message: "Election data updated successfully"});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

