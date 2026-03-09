import * as AdminSpeakerSlotsService from "../../services/speakerSlots/adminSpeakerSlotsService.js";
import { sendDueReminders } from "../../services/speakerSlots/speakerReminderService.js";
import { isValidObjectId } from "../../utils/validators.js";

export async function getEvents(req, res) {
  try {
    const events = await AdminSpeakerSlotsService.getEvents();
    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getSchedule(req, res) {
  try {
    const { eventId } = req.params;
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const schedule = await AdminSpeakerSlotsService.getSchedule(eventId);
    if (!schedule) return res.status(404).json({ message: "Event not found." });
    return res.json(schedule);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getConfirmedBookings(req, res) {
  try {
    const { eventId } = req.params;
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const data = await AdminSpeakerSlotsService.getConfirmedBookings(eventId);
    if (!data) return res.status(404).json({ message: "Event not found." });
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function exportCsv(req, res) {
  try {
    const { eventId } = req.params;
    const format = req.query.format || "csv";
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const csv = await AdminSpeakerSlotsService.exportScheduleCsv(eventId);
    if (!csv) return res.status(404).json({ message: "Event not found." });
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=speaker-schedule.csv");
      return res.send(csv);
    }
    return res.json({ csv });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function patchBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const { slotId, status } = req.body;
    if (!isValidObjectId(bookingId)) return res.status(400).json({ message: "Invalid booking ID." });
    const updates = {};
    if (slotId) updates.slotId = slotId;
    if (status) updates.status = status;
    const booking = await AdminSpeakerSlotsService.moveBooking(bookingId, updates);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    return res.json(booking);
  } catch (err) {
    if (err.message === "Target slot is full.")
      return res.status(409).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function deleteBooking(req, res) {
  try {
    const { bookingId } = req.params;
    if (!isValidObjectId(bookingId)) return res.status(400).json({ message: "Invalid booking ID." });
    const booking = await AdminSpeakerSlotsService.deleteBooking(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    return res.json({ message: "Booking cancelled.", booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function deleteSlot(req, res) {
  try {
    const { slotId } = req.params;
    if (!isValidObjectId(slotId)) return res.status(400).json({ message: "Invalid slot ID." });
    const result = await AdminSpeakerSlotsService.deleteSlot(slotId);
    if (!result) return res.status(404).json({ message: "Slot not found." });
    return res.json({ message: "Slot deleted. Any bookings on it were cancelled.", ...result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function createSlots(req, res) {
  try {
    const { eventId } = req.params;
    const slotsPayload = Array.isArray(req.body) ? req.body : req.body.slots || [];
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const created = await AdminSpeakerSlotsService.createSlots(eventId, slotsPayload);
    if (!created) return res.status(404).json({ message: "Event not found." });
    return res.status(201).json({ slots: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getSlots(req, res) {
  try {
    const { eventId } = req.params;
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const slots = await AdminSpeakerSlotsService.getSlots(eventId);
    return res.json(slots);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function createInvites(req, res) {
  try {
    const { eventId } = req.params;
    const { count = 1, expiresAt } = req.body;
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const tokens = await AdminSpeakerSlotsService.createInvites(eventId, count, expiresAt);
    if (!tokens) return res.status(404).json({ message: "Event not found." });
    return res.status(201).json({ invites: tokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function sendReminders(req, res) {
  try {
    const results = await sendDueReminders();
    return res.json({
      message: "Reminder job completed.",
      sent7d: results.sent7d,
      sent24h: results.sent24h,
      sent2h: results.sent2h,
      errors: results.errors,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}
