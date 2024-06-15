// controllers/electionController.js
import {
  createElectionService,
  getAllElectionsService,
  getOngoingElectionsService,
  getPreviousElectionsService,
  getElectionByTypeAndYearService,
  uploadElectionDataService,
  getUserElectionDataService,
  deleteUserElectionDataService,
  updateUserElectionDataService,
} from "../../services/Election/electionService.js";
import { formatError } from "../../utils/errorHandler.js";

export const createElectionController = async (req, res) => {
  try {
    const newElection = await createElectionService(req.body);
    res.status(201).json(newElection);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getAllElectionsController = async (req, res) => {
  try {
    const elections = await getAllElectionsService();
    res.json(elections);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getOngoingElectionsController = async (req, res) => {
  try {
    const ongoingElections = await getOngoingElectionsService();
    res.json(ongoingElections);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getPreviousElectionsController = async (req, res) => {
  try {
    const previousElections = await getPreviousElectionsService();
    res.json(previousElections);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getElectionByTypeAndYearController = async (req, res) => {
  try {
    const { type, year } = req.params;
    const election = await getElectionByTypeAndYearService(type, year);
    res.json(election);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const uploadElectionDataController = async (req, res) => {
  try {
    const { type, year } = req.params;
    const data = await uploadElectionDataService(
      req.user._id,
      type,
      year,
      req.files,
      req.body
    );
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getUserElectionDataController = async (req, res) => {
  try {
    const data = await getUserElectionDataService(req.user._id);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteUserElectionDataController = async (req, res) => {
  try {
    const data = await deleteUserElectionDataService(
      req.user._id,
      req.params.id
    );
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateUserElectionDataController = async (req, res) => {
  try {
    const data = await updateUserElectionDataService(
      req.user._id,
      req.params.id,
      req.files,
      req.body
    );
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
