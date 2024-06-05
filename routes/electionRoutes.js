import express from "express";
import {
  createElection,
  getAllElections,
  // getElectionsByType,
} from "../controllers/electionController.js";
import {
  authMiddleware
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createElection);
router.get("/", authMiddleware, getAllElections);
// router.get("/type/:type", authenticateToken, getElectionsByType);

export default router;
