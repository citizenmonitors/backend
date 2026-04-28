import express from "express";
import { validateUserSession } from "../controllers/sessionController.ts";

const router = express.Router();

router.post("/validate", validateUserSession);

export default router;
