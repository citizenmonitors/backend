import express from "express";
import * as SpeakerSlotsController from "../controllers/speakerSlots/speakerSlotsController.ts";
import { bookSlotValidation, handleValidationErrors } from "../validators/speakerSlotsValidators.ts";

const router = express.Router();

router.get("/seed-data", SpeakerSlotsController.getSeedData);
router.get("/invite/:token", SpeakerSlotsController.getInvite);
router.post("/book", bookSlotValidation, handleValidationErrors, SpeakerSlotsController.bookSlot);
router.get("/booking/confirm/:bookingId", SpeakerSlotsController.getBookingConfirm);
router.get("/booking/:bookingId/ics", SpeakerSlotsController.getBookingIcs);

export default router;
