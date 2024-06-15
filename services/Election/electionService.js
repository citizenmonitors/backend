// services/electionService.js
import Election from "../../models/Election.js";
import ElectionData from "../../models/ElectionData.js";
import { formatError } from "../../utils/errorHandler.js";

export const createElectionService = async (data) => {
  try {
    const existingElection = await Election.findOne({
      year: data.year,
      type: data.type,
    });
    if (existingElection) {
      throw formatError("Election type for this year already exists", 400);
    }

    const newElection = new Election(data);
    await newElection.save();
    return newElection;
  } catch (error) {
    throw new Error("Error creating election", error);
  }
};

export const getAllElectionsService = async () => {
  try {
    const elections = await Election.find();
    return elections;
  } catch (error) {
    throw formatError("Error fetching elections", 500, error);
  }
};

export const getOngoingElectionsService = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const ongoingElections = await Election.find({ year: currentYear });
    return ongoingElections;
  } catch (error) {
    throw formatError("Error fetching ongoing elections", 500, error);
  }
};
export const getPreviousElectionsService = async () => {
  const currentYear = new Date().getFullYear();
  const previousElections = await Election.find({ year: { $lt: currentYear } });
  const electionData = await ElectionData.find({
    electionId: { $in: previousElections.map((e) => e._id) },
  });

  return previousElections.map((election) => {
    const data = electionData.filter(
      (ed) => ed.electionId.toString() === election._id.toString()
    );
    return { ...election.toObject(), data };
  });
};
export const getElectionByTypeAndYearService = async (type, year) => {
  try {
    const election = await Election.findOne({ type, year });
    if (!election) {
      throw formatError("Election not found", 404);
    }
    return election;
  } catch (error) {
    throw formatError("Error fetching election", 500, error);
  }
};

export const uploadElectionDataService = async (
  userId,
  type,
  year,
  files,
  body
) => {
  try {
    const { votes, rating } = body;
    const resultSheets = files["resultSheets"]?.map((file) => file.path) || [];
    const videos = files["videos"]?.map((file) => file.path) || [];

    const election = await Election.findOne({ type, year });
    if (!election) {
      throw formatError("Election not found", 404);
    }

    const electionData = new ElectionData({
      user: userId,
      election: election._id,
      resultSheets,
      videos,
      votes: JSON.parse(votes),
      rating,
    });

    await electionData.save();

    return electionData;
  } catch (error) {
    throw formatError("Error uploading election data", 500, error);
  }
};

export const getUserElectionDataService = async (userId) => {
  try {
    const userElectionData = await ElectionData.find({ user: userId }).populate(
      "election"
    );
    return userElectionData;
  } catch (error) {
    throw formatError("Error fetching user election data", 500, error);
  }
};

export const deleteUserElectionDataService = async (userId, electionDataId) => {
  try {
    const electionData = await ElectionData.findOneAndDelete({
      _id: electionDataId,
      user: userId,
    });
    if (!electionData) {
      throw formatError("Election data not found", 404);
    }
    return electionData;
  } catch (error) {
    throw formatError("Error deleting election data", 500, error);
  }
};

export const updateUserElectionDataService = async (
  userId,
  electionDataId,
  files,
  body
) => {
  try {
    const { votes, rating } = body;
    const resultSheets = files["resultSheets"]?.map((file) => file.path) || [];
    const videos = files["videos"]?.map((file) => file.path) || [];

    const electionData = await ElectionData.findOne({
      _id: electionDataId,
      user: userId,
    });
    if (!electionData) {
      throw formatError("Election data not found", 404);
    }

    electionData.votes = JSON.parse(votes);
    electionData.rating = rating;
    electionData.resultSheets.push(...resultSheets);
    electionData.videos.push(...videos);

    await electionData.save();

    return electionData;
  } catch (error) {
    throw formatError("Error updating election data", 500, error);
  }
};
