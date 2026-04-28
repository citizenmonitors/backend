import SpeakerBooking from "../../models/SpeakerSlots/SpeakerBooking.js";
import { sendEmail } from "../../config/email.js";
import {
  speakerSlotReminder7DaysTemplate,
  speakerSlotReminder24HoursTemplate,
  speakerSlotReminder2HoursTemplate,
} from "../../config/emailTemplates.js";

const SPACE_LINK: string = process.env.SPEAKER_SPACE_LINK || "";

/**
 * Parse slot start as Date in UTC.
 * dayDate = "YYYY-MM-DD", startTime = "HH:MM" (WAT = UTC+1).
 */
function getSlotStartUtc(
  dayDate: string | null | undefined,
  startTime: string | null | undefined
): Date | null {
  if (!dayDate || !startTime) return null;

  const [y, m, d] = dayDate.split("-").map(Number);
  const [hour, min] = startTime.split(":").map(Number);

  if ([y, m, d, hour, min].some((n) => Number.isNaN(n))) return null;

  const wat = new Date(Date.UTC(y, m - 1, d, hour, min || 0, 0));
  return new Date(wat.getTime() - 60 * 60 * 1000);
}

type ReminderError = { bookingId: unknown; message: string };
type ReminderResults = {
  sent7d: number;
  sent24h: number;
  sent2h: number;
  errors: ReminderError[];
};
type ReminderBooking = {
  _id: unknown;
  fullName: string;
  email: string;
  remindersSent?: {
    sent7d?: Date | null;
    sent24h?: Date | null;
    sent2h?: Date | null;
  };
  slotId?: {
    startTime?: string;
    theme?: string;
    dayId?: { date?: string };
  };
};

/**
 * Send due reminder emails for confirmed speaker bookings.
 * Call from cron or admin endpoint (e.g. every hour).
 */
export async function sendDueReminders(): Promise<ReminderResults> {
  const now = new Date();
  const ms7d = 7 * 24 * 60 * 60 * 1000;
  const ms24h = 24 * 60 * 60 * 1000;
  const ms2h = 2 * 60 * 60 * 1000;
  const window7d = 60 * 60 * 1000;
  const window24h = 45 * 60 * 1000;
  const window2h = 30 * 60 * 1000;

  const bookings = (await SpeakerBooking.find({
    status: "confirmed",
  })
    .populate({ path: "slotId", populate: { path: "dayId" } })
    .lean()) as ReminderBooking[];

  const results: ReminderResults = {
    sent7d: 0,
    sent24h: 0,
    sent2h: 0,
    errors: [],
  };

  for (const booking of bookings) {
    const slot = booking.slotId;
    if (!slot || !slot.dayId) continue;

    const dayDate: string | undefined = slot.dayId.date;
    const startTime: string | undefined = slot.startTime;
    const slotStart = getSlotStartUtc(dayDate, startTime);
    if (!slotStart) continue;

    const firstName =
      (booking.fullName || "").trim().split(/\s+/)[0] || booking.fullName;
    const date = dayDate || "";
    const timeWAT = `${startTime} WAT`;
    const theme = slot.theme || "";

    try {
      if (!booking.remindersSent?.sent7d) {
        const diff7 = slotStart.getTime() - now.getTime();
        if (diff7 >= ms7d - window7d && diff7 <= ms7d + window7d) {
          const html = speakerSlotReminder7DaysTemplate({
            firstName,
            date,
            timeWAT,
            theme,
          });
          await sendEmail({
            to: booking.email,
            subject: "Reminder: Your Slot is Next Week (72-Hour X Space)",
            htmlbody: html,
          });
          await SpeakerBooking.updateOne(
            { _id: booking._id },
            { "remindersSent.sent7d": new Date() }
          );
          results.sent7d += 1;
        }
      }

      if (!booking.remindersSent?.sent24h) {
        const diff24 = slotStart.getTime() - now.getTime();
        if (diff24 >= ms24h - window24h && diff24 <= ms24h + window24h) {
          const html = speakerSlotReminder24HoursTemplate({
            firstName,
            date,
            timeWAT,
            theme,
            spaceLink: SPACE_LINK,
          });
          await sendEmail({
            to: booking.email,
            subject:
              "24-Hour Reminder: Your Slot is Tomorrow (72-Hour X Space)",
            htmlbody: html,
          });
          await SpeakerBooking.updateOne(
            { _id: booking._id },
            { "remindersSent.sent24h": new Date() }
          );
          results.sent24h += 1;
        }
      }

      if (!booking.remindersSent?.sent2h) {
        const diff2 = slotStart.getTime() - now.getTime();
        if (diff2 >= ms2h - window2h && diff2 <= ms2h + window2h) {
          const html = speakerSlotReminder2HoursTemplate({
            firstName,
            timeWAT,
            spaceLink: SPACE_LINK,
          });
          await sendEmail({
            to: booking.email,
            subject: "Starting Soon: Your Slot in 2 Hours (72-Hour X Space)",
            htmlbody: html,
          });
          await SpeakerBooking.updateOne(
            { _id: booking._id },
            { "remindersSent.sent2h": new Date() }
          );
          results.sent2h += 1;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.errors.push({ bookingId: booking._id, message });
    }
  }

  return results;
}

