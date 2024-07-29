import express from "express";
import {
    getAllAdminController,
    getDailyTrafficController,
    getTotalActiveUserController,
  getTotalRegisteredUsersController,
  getTotalResultsUploadedController,
  getTotalVolunteerUsersController,
  getUserInfoController,
} from "../../controllers/adminController/adminElectionController.js";
import { authMiddleware, isAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/admin/total-users",
  authMiddleware,
  isAdmin, getTotalRegisteredUsersController
);

router.get(
  "/admin/total-volunteers",
  authMiddleware,
  isAdmin,
  getTotalVolunteerUsersController
);
router.get(
  "/admin/active-users",
  authMiddleware,
  isAdmin,
  getTotalActiveUserController
);

router.get(
  "/admin/results-uploaded",
  authMiddleware,
  isAdmin,
  getTotalResultsUploadedController
);
router.get("/admin/users-info", authMiddleware, isAdmin, getUserInfoController);
router.get("/admin/admins", authMiddleware, isAdmin, getAllAdminController);
router.get(
  "/admin/daily-traffic",
  authMiddleware,
  isAdmin,
  getDailyTrafficController
);

export default router; 