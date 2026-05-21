import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { dismissMobileNotificationController, getMobileNotificationById, listMobileNotifications, readAllMobileNotifications, readMobileNotification, sendTestMobileNotification, } from "../../controllers/mobile/notificationController.js";
const router = express.Router();
// Inbox list + unread count
router.get("/", authMiddleware, listMobileNotifications);
// Mark all read (before /:notificationId)
router.post("/read-all", authMiddleware, readAllMobileNotifications);
// Dev/staging: send test notification to self (disabled in production unless ALLOW_NOTIFICATION_TEST=true)
router.post("/test", authMiddleware, sendTestMobileNotification);
// Detail view (also marks read)
router.get("/:notificationId", authMiddleware, getMobileNotificationById);
// Mark one read
router.post("/:notificationId/read", authMiddleware, readMobileNotification);
// Remove from inbox (soft delete for current user)
router.delete("/:notificationId", authMiddleware, dismissMobileNotificationController);
export default router;
//# sourceMappingURL=notificationRoutes.js.map