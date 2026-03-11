import express from "express";
import * as AdminCont from "../../controllers/adminController/adminElectionController.js";
import {
  authMiddleware,
  isAdmin,
  isSuperAdmin,
  isAuthorized,
} from "../../middleware/authMiddleware.js";
import { getDashboardController } from "../../controllers/adminController/adminDashboard.js";
import * as AdminController from "../../controllers/adminController/adminDashboard.js";
import * as PodcastController from "../../controllers/adminController/podcastController.js";
import * as AdminSpeakerSlotsController from "../../controllers/speakerSlots/adminSpeakerSlotsController.js";

const router = express.Router();

router.get("/admin/", authMiddleware, isAdmin, AdminCont.getDashboardDataController);
router.get("/admin/admins", authMiddleware, isAuthorized("getAdmins"), AdminCont.getAllAdminController);
router.get("/admin/dashboard", authMiddleware, isAdmin, getDashboardController);
router.get(
  "/admin/live-election/:electionId", authMiddleware,
  isAdmin, AdminCont.getAdminLiveElectionController
);

router.get("/admin/elections", authMiddleware, isAdmin, AdminCont.getAllElections);
router.get(
  "/admin/election-types",
  authMiddleware,
  isAdmin,
  AdminCont.getAllElectionTypes
);
router.get(
  "/admin/results",
  authMiddleware,
  isAuthorized("viewResults"),
  AdminCont.getAllElectionAndIncidentController
);
router.get(
  "/admin/result/:id",
  authMiddleware,
  isAuthorized("viewResult"),
  AdminCont.getResultOrIncidentByController
);
router.delete(
  "/admin/result/:id",
  authMiddleware,
  isAuthorized("deleteResult"),
  AdminCont.deletedResultOrIncidentController
);
router.get("/admin/users", authMiddleware,   isAuthorized("viewUsers"), AdminCont.getAllUsersController);
router.get("/admin/user/:id", authMiddleware,   isAuthorized("viewUser"), AdminCont.getUserByIdController);
router.delete(
  "/admin/user/:id",
  authMiddleware,
  isAuthorized("deleteUser"),
  AdminCont.deleteUserByIdController
);

router.patch(
  "/admin/approve-observer/:id",
  authMiddleware,
  isAuthorized("approveObserver"),
  AdminCont.approveObserverController
);
router.patch(
  "/admin/unapprove-observer/:id",
  authMiddleware,
  isAuthorized("unapproveObserver"),
  AdminCont.unapproveObserverController
);
router.get("/admin/observers/", authMiddleware, isAdmin, AdminCont.getAllObserver);
router.patch(
  "/admin/downgrade-observer/:id",
  authMiddleware,
  isAuthorized("downgradeObserver"),
  AdminCont.downgradeObserverController
);
router.get(
  "/admin/flagged-results/",
  authMiddleware,
  isAdmin,
  AdminCont.getFlaggedResultsCon
);
router.delete(
  "/admin/delete-flagged/:id",
  authMiddleware,
  isAuthorized("deleteFlagged"),
  AdminCont.deleteFlaggedResultController
);

router.put(
  "/admin/restore-flagged/:id",
  authMiddleware,
  isAuthorized("restoreFlagged"),
  AdminCont.restoreFlaggedResultController
);
router.get(
  "/admin/single-flagged/:id",
  authMiddleware,
  isAdmin,
  AdminCont.getSingleFlaggedElectionController
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
router.post("/admin/newsletter", authMiddleware, PodcastController.sendNewsletter);
router.patch("/admin/podcast/:id", authMiddleware, isAdmin, PodcastController.editPodcast);
router.get("/admin/podcast", authMiddleware, isAdmin, PodcastController.getAllPodcasts);
router.delete("/admin/podcast/:id", authMiddleware, isAdmin, PodcastController.deletePodcast);
router.get("/podcast/:id", authMiddleware, PodcastController.getSinglePodcast);
router.get("/podcasts/inbox", authMiddleware, PodcastController.getUserInbox);
router.patch("/podcast/mark-read/:podcastId", authMiddleware, PodcastController.markPodcastAsRead);
router.get("/admin/notifications", authMiddleware, isAdmin, AdminCont.adminNotificationController);
router.patch("/admin/notification/mark-read/:notificationId", authMiddleware, isAdmin, AdminCont.markNotificationAsRead);
router.patch("/admin/notification/delete/:notificationId", authMiddleware, isAdmin, AdminCont.deleteNotificationForUser);
router.get("/admin/emails", authMiddleware, isAdmin, AdminController.getUserEmailsController);

// Speaker slots (72-Hour X Space)
router.get("/admin/speaker-slots/events", authMiddleware, isAdmin, AdminSpeakerSlotsController.getEvents);
router.get("/admin/speaker-slots/events/:eventId/schedule", authMiddleware, isAdmin, AdminSpeakerSlotsController.getSchedule);
router.get("/admin/speaker-slots/events/:eventId/bookings", authMiddleware, isAdmin, AdminSpeakerSlotsController.getConfirmedBookings);
router.get("/admin/speaker-slots/events/:eventId/export", authMiddleware, isAdmin, AdminSpeakerSlotsController.exportCsv);
router.patch("/admin/speaker-slots/bookings/:bookingId", authMiddleware, isAdmin, AdminSpeakerSlotsController.patchBooking);
router.delete("/admin/speaker-slots/bookings/:bookingId", authMiddleware, isAdmin, AdminSpeakerSlotsController.deleteBooking);
router.post("/admin/speaker-slots/events/:eventId/slots", authMiddleware, isAdmin, AdminSpeakerSlotsController.createSlots);
router.get("/admin/speaker-slots/events/:eventId/slots", authMiddleware, isAdmin, AdminSpeakerSlotsController.getSlots);
router.delete("/admin/speaker-slots/slots/:slotId", authMiddleware, isAdmin, AdminSpeakerSlotsController.deleteSlot);
router.post("/admin/speaker-slots/events/:eventId/invites", authMiddleware, isAdmin, AdminSpeakerSlotsController.createInvites);
router.post("/admin/speaker-slots/reminders/send", authMiddleware, isAdmin, AdminSpeakerSlotsController.sendReminders);

export default router;



