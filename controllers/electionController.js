import {
  createElectionRecord,
  getElections,
  getElectionsByType,
} from "../services/electionService.js";
import multer from "../config/multer.js";

export const createElection = [
  multer.fields([
    { name: "signedResultImage", maxCount: 1 },
    { name: "resultAnnouncementVideo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = req.user; 
      const election = await createElectionRecord(req.body, user, req.files);
      res
        .status(201)
        .json({ message: "Election record created successfully", election });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
];

export const getAllElections = async (req, res) => {
  try {
    const elections = await getElections();
    res.status(200).json(elections);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// export const getElectionsByType = async (req, res) => {
//   try {
//     const { type } = req.params;
//     const elections = await getElectionsByType(type);
//     res.status(200).json(elections);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };
