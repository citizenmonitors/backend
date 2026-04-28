import express from "express";
import * as SpeakerSlotsController from "../controllers/speakerSlots/speakerSlotsController.js";
import { bookSlotValidation, handleValidationErrors } from "../validators/speakerSlotsValidators.js";
const router = express.Router();
router.get("/seed-data", SpeakerSlotsController.getSeedData);
router.get("/invite/:token", SpeakerSlotsController.getInvite);
router.post("/book", bookSlotValidation, handleValidationErrors, SpeakerSlotsController.bookSlot);
router.get("/booking/confirm/:bookingId", SpeakerSlotsController.getBookingConfirm);
router.get("/booking/:bookingId/ics", SpeakerSlotsController.getBookingIcs);
export default router;
//# sourceMappingURL=speakerSlots.js.map