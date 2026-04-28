import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { getMobileNotificationById, listMobileNotifications, readAllMobileNotifications, readMobileNotification, } from "../../controllers/mobile/notificationController.js";
const router = express.Router();
// Inbox list + unread count
router.get("/", authMiddleware, listMobileNotifications);
// Detail view (also marks read)
router.get("/:notificationId", authMiddleware, getMobileNotificationById);
// Mark one read
router.post("/:notificationId/read", authMiddleware, readMobileNotification);
// Mark all read
router.post("/read-all", authMiddleware, readAllMobileNotifications);
export default router;
//# sourceMappingURL=notificationRoutes.js.map