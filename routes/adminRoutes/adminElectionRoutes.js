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
  getAllElectionTypes,
  getAllElections,
  getAllObserver,
  getAllUsersController,
  getDashboardDataController,
  getFlaggedResultsCon,
  getResultOrIncidentByController,
  getSingleFlaggedElectionController,
  getUserByIdController,
  restoreFlaggedResultController,
} from "../../controllers/adminController/adminElectionController.js";
import {
  authMiddleware,
  isAdmin,
  isSuperAdmin,
  isAuthorized,
} from "../../middleware/authMiddleware.js";
import { getDashboardController } from "../../controllers/adminController/adminDashboard.js";
import * as AdminController from "../../controllers/adminController/adminDashboard.js";
import * as PodcastController from "../../controllers/adminController/podcastController.js";

const router = express.Router();

router.get("/admin/", authMiddleware, isAdmin, getDashboardDataController);
router.get("/admin/admins", authMiddleware, isAuthorized("getAdmins"), getAllAdminController);
router.get("/admin/dashboard", authMiddleware, isAdmin, getDashboardController);
router.get(
  "/admin/live-election/:electionId",
  authMiddleware,
  isAdmin,
  getAdminLiveElectionController
);

router.get("/admin/elections", authMiddleware, isAdmin, getAllElections);
router.get(
  "/admin/election-types",
  authMiddleware,
  isAdmin,
  getAllElectionTypes
);
router.get(
  "/admin/results",
  authMiddleware,
  isAuthorized("viewResults"),
  getAllElectionAndIncidentController
);
router.get(
  "/admin/result/:id",
  authMiddleware,
  isAuthorized("viewResult"),
  getResultOrIncidentByController
);
router.delete(
  "/admin/result/:id",
  authMiddleware,
  isAuthorized("deleteResult"),
  deletedResultOrIncidentController
);
router.get("/admin/users", authMiddleware,   isAuthorized("viewUsers"), getAllUsersController);
router.get("/admin/user/:id", authMiddleware,   isAuthorized("viewUser"), getUserByIdController);
router.delete(
  "/admin/user/:id",
  authMiddleware,
  isAuthorized("deleteUser"),
  deleteUserByIdController
);

router.patch(
  "/admin/approve-observer/:id",
  authMiddleware,
  isAuthorized("approveObserver"),
  approveObserverController
);
router.get("/admin/observers/", authMiddleware, isAdmin, getAllObserver);
router.patch(
  "/admin/downgrade-observer/:id",
  authMiddleware,
  isAuthorized("downgradeObserver"),
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
  isAuthorized("deleteFlagged"),
  deleteFlaggedResultController
);

router.put(
  "/admin/restore-flagged/:id",
  authMiddleware,
  isAuthorized("restoreFlagged"),
  restoreFlaggedResultController
);
router.get(
  "/admin/single-flagged/:id",
  authMiddleware,
  isAdmin,
  getSingleFlaggedElectionController
);

router.post(
  "/admin/invite-admin",
  authMiddleware,
  isSuperAdmin,
  AdminController.inviteAdmin
);
router.put(
  "/admin/update-admin/:adminId",
  authMiddleware,
  isSuperAdmin,
  AdminController.updateAdminPermissions
);
router.patch(
  "/admin/suspend-admin/:adminId",
  authMiddleware,
  isSuperAdmin,
  AdminController.suspendAdmin
);
router.get(
  "/admin/get-admins",
  authMiddleware,
  isSuperAdmin,
  AdminController.getAllAdmins
);
router.get(
  "/admin/logs/:adminId",
  authMiddleware,
  isSuperAdmin,
  AdminController.getAdminLogs
);
router.get(
  "/admin/access-control",
  authMiddleware,
  isSuperAdmin,
  AdminController.getAccessControl
);
router.get(
  "/admin/single-admin/:adminId",
  authMiddleware,
  isAdmin,
  AdminController.getSingleAdmin
);

router.post("/admin/podcast", authMiddleware, isAdmin, PodcastController.sendPodcast);
router.patch("/admin/podcast/:id", authMiddleware, isAdmin, PodcastController.editPodcast);
router.get("/admin/podcast", authMiddleware, isAdmin, PodcastController.getAllPodcasts);
router.get("/admin/podcast/:id", authMiddleware, PodcastController.getSinglePodcast);
router.delete("/admin/podcast/:id", authMiddleware, PodcastController.deletePodcast);
router.get("/admin/podcasts/inbox", authMiddleware, PodcastController.getUserInbox);

export default router;
