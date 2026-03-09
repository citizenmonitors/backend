import * as SpeakerSlotsService from "../../services/speakerSlots/speakerSlotsService.js";
import { loadSeedData } from "../../services/speakerSlots/seedSpeakerEvent.js";

export async function getSeedData(req, res) {
  try {
    const data = loadSeedData();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getInvite(req, res) {
  try {
    const { token } = req.params;
    const result = await SpeakerSlotsService.getInviteByToken(token);
    if (!result.valid) {
      const status = result.code === "expired" ? 410 : 404;
      return res.status(status).json({
        valid: false,
        message: result.code === "expired" ? "This invite link has expired." : "Invalid or expired invite link.",
      });
    }
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function bookSlot(req, res) {
  try {
    const payload = await SpeakerSlotsService.bookSlot(req.body);
    return res.status(201).json({
      success: true,
      message: "Your slot is confirmed.",
      booking: payload,
      confirmationEmailSent: payload.confirmationEmailSent,
      calendarIcsUrl: payload.calendarIcsUrl,
    });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: err.message,
        ...(err.existingBookingId && { existingBookingId: err.existingBookingId }),
      });
    }
    if (err.message && err.message.includes("invite")) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message && (err.message.includes("slot") || err.message.includes("available"))) {
      return res.status(409).json({ success: false, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: "An error occurred." });
  }
}

export async function getBookingConfirm(req, res) {
  try {
    const { bookingId } = req.params;
    const booking = await SpeakerSlotsService.getBookingForConfirm(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    return res.json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}

export async function getBookingIcs(req, res) {
  try {
    const { bookingId } = req.params;
    const booking = await SpeakerSlotsService.getBookingForConfirm(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const slot = booking.slot;
    const date = slot.date;
    const startTimeStr = (slot.startTimeWAT || "10:00 WAT").replace(/\s*WAT\s*/i, "").trim();
    const endTimeStr = (slot.endTimeWAT || "10:30 WAT").replace(/\s*WAT\s*/i, "").trim();
    const [startH, startM] = startTimeStr.split(":").map(Number);
    const [endH, endM] = endTimeStr.split(":").map(Number);
    const start = new Date(`${date}T${String(startH).padStart(2, "0")}:${String(startM || 0).padStart(2, "0")}:00+01:00`);
    const end = new Date(`${date}T${String(endH).padStart(2, "0")}:${String(endM || 0).padStart(2, "0")}:00+01:00`);

    const formatIcsDate = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Citizen Monitors//72-Hour X Space//EN",
      "BEGIN:VEVENT",
      `UID:booking-${booking.bookingId}@citizenmonitors.com`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:72-Hour X Space – ${slot.theme} (Speaker)`,
      `DESCRIPTION:Your speaker slot. Theme: ${slot.theme}. Format: ${slot.sessionType}.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="speaker-slot-${booking.bookingId}.ics"`);
    return res.send(ics);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred." });
  }
}
