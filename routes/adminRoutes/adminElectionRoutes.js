import express from "express";
import {
    getAdminLiveElectionController,
    getAllAdminController,
    getAllElections,
    getDashboardDataController,

} from "../../controllers/adminController/adminElectionController.js";
import { authMiddleware, isAdmin } from "../../middleware/authMiddleware.js";
import { getDashboardController } from "../../controllers/adminController/adminDashboard.js";

const router = express.Router();


router.get("/admin/", getDashboardDataController)
router.get("/admin/admins", authMiddleware, isAdmin, getAllAdminController);
router.get("/admin/dashboard", authMiddleware, isAdmin, getDashboardController);
router.get(
  "/admin/live-election/:electionId",
  authMiddleware,
  isAdmin,
  getAdminLiveElectionController
);
router.get("/admin/elections", authMiddleware, isAdmin, getAllElections);

export default router; 