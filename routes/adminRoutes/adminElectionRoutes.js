import express from "express";
import {
  deleteUserByIdController,
  deletedResultOrIncidentController,
    getAdminLiveElectionController,
    getAllAdminController,
    getAllElectionAndIncidentController,
    getAllElections,
    getAllUsersController,
    getDashboardDataController,
    getResultOrIncidentByController,
    getUserByIdController,

} from "../../controllers/adminController/adminElectionController.js";
import { authMiddleware, isAdmin } from "../../middleware/authMiddleware.js";
import { getDashboardController } from "../../controllers/adminController/adminDashboard.js";

const router = express.Router();


router.get("/admin/", getDashboardDataController)
router.get("/admin/admins", authMiddleware, isAdmin, getAllAdminController);
router.get("/admin/dashboard", authMiddleware, isAdmin, getDashboardController);
router.get("/admin/live-election/:electionId", authMiddleware, isAdmin, getAdminLiveElectionController
);
router.get("/admin/elections", authMiddleware, isAdmin, getAllElections);
router.get(
  "/admin/results",
  authMiddleware,
  isAdmin,
  getAllElectionAndIncidentController);
router.get(
  "/admin/result/:id",
  authMiddleware,
  isAdmin,
  getResultOrIncidentByController
);
router.delete(
  "/admin/result/:id",
  authMiddleware,
  isAdmin,
  deletedResultOrIncidentController);
router.get("/admin/users", authMiddleware, isAdmin, getAllUsersController);
router.get("/admin/user/:id", authMiddleware, isAdmin, getUserByIdController);
router.delete(
  "/admin/user/:id",
  authMiddleware,
  isAdmin,
  deleteUserByIdController);

export default router; 
