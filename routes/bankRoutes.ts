import express from "express";
import { getAllBanks } from "../controllers/bankController.ts";

const router = express.Router();

router.get("/banks", getAllBanks);

export default router;
