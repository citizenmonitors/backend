import type { Request, Response } from "express";
import * as AdminSpeakerSlotsService from "../../services/speakerSlots/adminSpeakerSlotsService.ts";
import { sendDueReminders } from "../../services/speakerSlots/speakerReminderService.ts";
import { ensureDefaultSpeakerEvent } from "../../services/speakerSlots/seedSpeakerEvent.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export async function getEvents(_req: Request, res: Response) {
  try {
    const events = await AdminSpeakerSlotsService.getEvents();
    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getDays(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const days = await AdminSpeakerSlotsService.getDays(eventId);
    if (!days) return res.status(404).json({ message: "Event not found." });
    return res.json(days);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function createDay(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
    const { date, label, theme, description, sortOrder } = req.body;
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    if (!date || !label || !theme) return res.status(400).json({ message: "date, label, and theme are required." });
    const day = await AdminSpeakerSlotsService.createDay(eventId, req.body);
    if (!day) return res.status(404).json({ message: "Event not found." });
    return res.status(201).json(day);
  } catch (err) {
    if (getErrorMessage(err) === "Invalid date format.") return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD, ISO date string, or timestamp." });
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function patchDay(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
    const dayId = asParamString(req.params.dayId);
    const { date, label, theme, description, sortOrder } = req.body;
    if (!isValidObjectId(eventId) || !isValidObjectId(dayId)) return res.status(400).json({ message: "Invalid event or day ID." });
    const updates: {
      date?: unknown;
      label?: unknown;
      theme?: unknown;
      description?: unknown;
      sortOrder?: unknown;
    } = {};
    if (date !== undefined) updates.date = date;
    if (label !== undefined) updates.label = label;
    if (theme !== undefined) updates.theme = theme;
    if (description !== undefined) updates.description = description;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    const day = await AdminSpeakerSlotsService.updateDay(eventId, dayId, updates);
    if (!day) return res.status(404).json({ message: "Day not found." });
    return res.json(day);
  } catch (err) {
    if (getErrorMessage(err) === "Invalid date format.") return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD, ISO date string, or timestamp." });
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getSchedule(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const schedule = await AdminSpeakerSlotsService.getSchedule(eventId);
    if (!schedule) return res.status(404).json({ message: "Event not found." });
    return res.json(schedule);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getConfirmedBookings(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const data = await AdminSpeakerSlotsService.getConfirmedBookings(eventId);
    if (!data) return res.status(404).json({ message: "Event not found." });
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function exportCsv(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
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

export async function patchBooking(req: Request, res: Response) {
  try {
    const bookingId = asParamString(req.params.bookingId);
    const { slotId, status } = req.body;
    if (!isValidObjectId(bookingId)) return res.status(400).json({ message: "Invalid booking ID." });
    const updates: { slotId?: unknown; status?: unknown } = {};
    if (slotId) updates.slotId = slotId;
    if (status) updates.status = status;
    const booking = await AdminSpeakerSlotsService.moveBooking(bookingId, updates);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    return res.json(booking);
  } catch (err) {
    if (getErrorMessage(err) === "Target slot is full.")
      return res.status(409).json({ message: getErrorMessage(err) });
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function deleteBooking(req: Request, res: Response) {
  try {
    const bookingId = asParamString(req.params.bookingId);
    if (!isValidObjectId(bookingId)) return res.status(400).json({ message: "Invalid booking ID." });
    const booking = await AdminSpeakerSlotsService.deleteBooking(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    return res.json({ message: "Booking cancelled.", booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function deleteSlot(req: Request, res: Response) {
  try {
    const slotId = asParamString(req.params.slotId);
    if (!isValidObjectId(slotId)) return res.status(400).json({ message: "Invalid slot ID." });
    const result = await AdminSpeakerSlotsService.deleteSlot(slotId);
    if (!result) return res.status(404).json({ message: "Slot not found." });
    return res.json({ message: "Slot deleted. Any bookings on it were cancelled.", ...result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function createSlots(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
    let slotsPayload: unknown[] = Array.isArray(req.body) ? req.body : req.body.slots;
    if (slotsPayload == null && req.body && typeof req.body === "object" && (req.body.startTime != null || req.body.date != null))
      slotsPayload = [req.body];
    slotsPayload = Array.isArray(slotsPayload) ? slotsPayload : [];
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const created = await AdminSpeakerSlotsService.createSlots(
      eventId,
      slotsPayload as Array<{
        dayId?: string;
        date?: unknown;
        label?: unknown;
        theme?: unknown;
        startTime?: unknown;
        endTime?: unknown;
        capacity?: unknown;
        sessionType?: unknown;
      }>
    );
    if (!created) return res.status(404).json({ message: "Event not found." });
    return res.status(201).json({ slots: created });
  } catch (err) {
    if (getErrorMessage(err) === "Invalid date format.") return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD, ISO date string, or timestamp." });
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getSlots(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
    if (!isValidObjectId(eventId)) return res.status(400).json({ message: "Invalid event ID." });
    const slots = await AdminSpeakerSlotsService.getSlots(eventId);
    return res.json(slots);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function createInvites(req: Request, res: Response) {
  try {
    const eventId = asParamString(req.params.eventId);
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

export async function sendReminders(_req: Request, res: Response) {
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

/** Re-run speaker-slots seed: creates event, 3 days, slots, and one invite (from seed JSON). */
export async function runSeed(_req: Request, res: Response) {
  try {
    const event = await ensureDefaultSpeakerEvent();
    if (!event) return res.status(500).json({ message: "Seed failed." });
    return res.status(201).json({
      message: "Speaker slots data created.",
      event: { id: event._id, name: event.name, slug: event.slug },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}
