import {
  uploadElectionDataService,
  getUserElectionData,
  updateUserElectionData,
  deleteUserElectionData,
  createElection,
  addPoliticalParty,
  getPoliticalParties,
  getAllElectionResults,
  getElectionResultsByTypeAndYear,
} from "../../services/Election/electionService.js";

export const createElectionController = async (req, res) => {
  try {
    const { type, year, startDate, endDate } = req.body;
    const election = await createElection(type, year, startDate, endDate);
    res.status(201).json(election);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addPoliticalPartyController = async (req, res) => {
  try {
    const { partyName } = req.body;
    const party = await addPoliticalParty(partyName);
    res
      .status(201)
      .json({ message: "Political party added successfully", party });
  } catch (error) {
    if (error.message === "Political party already exists") {
      res.status(400).json({ message: "Political party already exists" });
    } else {
      res.status(500).json({ message: "Error adding political party", error });
    }
  }
};

export const getPoliticalPartiesController = async (req, res) => {
  try {
    const parties = await getPoliticalParties();
    res.status(200).json(parties);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching political parties", error });
  }
};
export const uploadElectionData = async (req, res) => {
  try {
    const result = await uploadElectionDataService(req);
    res.status(201).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading election data", error: error.message });
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
export const getElectionResultsByTypeAndYearController = async (req, res) => {
  try {
    const { type, year } = req.params;
    const data = await getElectionResultsByTypeAndYear(type, year);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching election results",
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

export const updateUserElectionDataController = async (req, res) => {
  try {
    const { dataId } = req.params;
    const userId = req.user._id;
    const data = req.body;

    const updatedElectionData = await updateUserElectionData(
      dataId,
      userId,
      data
    );
    res.status(200).json({ message: "Election data updated successfully", updatedElectionData});
  } catch (error) {
  res.status(500).json({ message: "Error updating election data", error: error.message });
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

