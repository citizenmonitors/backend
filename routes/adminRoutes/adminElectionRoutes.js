import express from "express";
import {
  approveObserverController,
  deleteFlaggedResultController,
  deleteUserByIdController,
  deletedResultOrIncidentController,
    downgradeObserverController,
    getAdminLiveElectionController,
    getAllAdminController,
    getAllElectionAndIncidentController,
    getAllElections,
    getAllObserver,
    getAllUsersController,
    getDashboardDataController,
    getFlaggedResultsCon,
    getResultOrIncidentByController,
    getUserByIdController,
    restoreFlaggedResultController,

} from "../../controllers/adminController/adminElectionController.js";
import { authMiddleware, isAdmin } from "../../middleware/authMiddleware.js";
import { getDashboardController } from "../../controllers/adminController/adminDashboard.js";

const router = express.Router();


router.get("/admin/", authMiddleware, isAdmin, getDashboardDataController)
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

router.patch("/admin/approve-observer/:id",authMiddleware, isAdmin, approveObserverController);
router.get("/admin/observers/", authMiddleware, isAdmin, getAllObserver);
router.patch(
  "/admin/downgrade-observer/:id",
  authMiddleware,
  isAdmin,
  downgradeObserverController
);
router.get(
  "/admin/flagged-results/",
  authMiddleware,
  isAdmin,
  getFlaggedResultsCon
);
router.delete(
  "/admin/delete-flagged/:id",
  authMiddleware,
  isAdmin,
  deleteFlaggedResultController
);

router.put(
  "/admin/restore-flagged/:id",
  authMiddleware,
  isAdmin,
  restoreFlaggedResultController
);

export default router; 

