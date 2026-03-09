import SpeakerInvite from "../../models/SpeakerSlots/SpeakerInvite.js";
import SpeakerEvent from "../../models/SpeakerSlots/SpeakerEvent.js";
import SpeakerEventDay from "../../models/SpeakerSlots/SpeakerEventDay.js";
import SpeakerSlot from "../../models/SpeakerSlots/SpeakerSlot.js";
import SpeakerBooking from "../../models/SpeakerSlots/SpeakerBooking.js";
import { sendEmail } from "../../config/email.js";
import {
  speakerSlotConfirmationTemplate,
  speakerSlotInternalNotificationTemplate,
} from "../../config/emailTemplates.js";
import mongoose from "mongoose";

const DEFAULT_NOTIFY_EMAILS = [
  // "olajumoke@citizenmonitors.com",
  // "adeshope@citizenmonitors.com",
  "yunus@citizenmonitors.com",
];
function getNotifyEmails() {
  const env = process.env.SPEAKER_SLOT_NOTIFY_EMAILS;
  if (env && typeof env === "string") {
    return env.split(",").map((e) => e.trim()).filter(Boolean);
  }
  return DEFAULT_NOTIFY_EMAILS;
}

const FEW_SPOTS_LEFT_THRESHOLD = 2;

function slotStatus(bookedCount, capacity) {
  if (bookedCount >= capacity) return "full";
  if (capacity - bookedCount <= FEW_SPOTS_LEFT_THRESHOLD) return "few_left";
  return "available";
}

export async function getInviteByToken(token) {
  const invite = await SpeakerInvite.findOne({ token }).populate("eventId").lean();
  if (!invite) return { valid: false, code: "invalid" };
  if (new Date(invite.expiresAt) < new Date()) return { valid: false, code: "expired" };

  const eventId = invite.eventId?._id;
  if (!eventId) return { valid: false, code: "invalid" };

  const event = await SpeakerEvent.findById(eventId).lean();
  if (!event) return { valid: false, code: "invalid" };

  const days = await SpeakerEventDay.find({ eventId }).sort({ sortOrder: 1 }).lean();
  const dayIds = days.map((d) => d._id.toString());

  // All slots for this event — list every slot so speakers can pick one they're available for
  const allSlots = await SpeakerSlot.find({ eventId })
    .populate("dayId")
    .lean();

  // Sort by day order then start time (so list order matches schedule)
  const dayOrder = Object.fromEntries(days.map((d, i) => [d._id.toString(), i]));
  allSlots.sort((a, b) => {
    const aDayId = a.dayId?._id?.toString() || a.dayId?.toString();
    const bDayId = b.dayId?._id?.toString() || b.dayId?.toString();
    const dayDiff = (dayOrder[aDayId] ?? 99) - (dayOrder[bDayId] ?? 99);
    if (dayDiff !== 0) return dayDiff;
    return (a.startTime || "").localeCompare(b.startTime || "");
  });

  const bookingCounts = await SpeakerBooking.aggregate([
    { $match: { slotId: { $in: allSlots.map((s) => s._id) }, status: "confirmed" } },
    { $group: { _id: "$slotId", count: { $sum: 1 } } },
  ]);
  const countBySlot = Object.fromEntries(bookingCounts.map((b) => [b._id.toString(), b.count]));

  const existingBooking = await SpeakerBooking.findOne({
    inviteId: invite._id,
    status: "confirmed",
  })
    .populate("slotId")
    .lean();

  const slotList = allSlots.map((s) => {
    const bookedCount = countBySlot[s._id.toString()] || 0;
    const cap = s.capacity || 1;
    const isYourSlot =
      existingBooking && existingBooking.slotId && existingBooking.slotId._id.toString() === s._id.toString();
    return {
      id: s._id.toString(),
      dayId: s.dayId?._id?.toString() || s.dayId?.toString(),
      date: s.dayId?.date || "",
      theme: s.theme,
      startTime: s.startTime,
      endTime: s.endTime,
      startTimeWAT: `${s.startTime} WAT`,
      endTimeWAT: `${s.endTime} WAT`,
      capacity: cap,
      bookedCount,
      status: slotStatus(bookedCount, cap),
      sessionType: s.sessionType || "keynote",
      isYourSlot: !!isYourSlot,
    };
  });

  // Schedule: days with their slots for easy "select slot" UI
  const schedule = days.map((d) => ({
    day: {
      id: d._id.toString(),
      label: d.label,
      name: d.label,
      date: d.date,
      theme: d.theme,
      sortOrder: d.sortOrder,
    },
    slots: slotList.filter((s) => s.dayId === d._id.toString()),
  }));

  const existingPayload = existingBooking
    ? {
        bookingId: existingBooking._id.toString(),
        slotId: existingBooking.slotId?._id?.toString(),
        slot: existingBooking.slotId
          ? {
              date: existingBooking.slotId.dayId?.date || "",
              startTimeWAT: `${existingBooking.slotId.startTime} WAT`,
              theme: existingBooking.slotId.theme,
              sessionType: existingBooking.slotId.sessionType || "keynote",
            }
          : null,
      }
    : null;

  return {
    valid: true,
    invite: {
      token: invite.token,
      eventId: event._id.toString(),
      eventName: event.name,
      expiresAt: invite.expiresAt,
    },
    days: days.map((d) => ({
      id: d._id.toString(),
      label: d.label,
      name: d.label,
      date: d.date,
      theme: d.theme,
      sortOrder: d.sortOrder,
    })),
    slots: slotList,
    schedule,
    existingBooking: existingPayload,
  };
}

export async function bookSlot(data) {
  const { inviteToken, slotId, fullName, email, xHandle, bioLink, topicAngle, phone } = data;

  const invite = await SpeakerInvite.findOne({ token: inviteToken }).populate("eventId");
  if (!invite) throw new Error("Invalid or expired invite link.");
  if (new Date(invite.expiresAt) < new Date()) throw new Error("Invalid or expired invite link.");

  const existing = await SpeakerBooking.findOne({ inviteId: invite._id, status: "confirmed" });
  if (existing)
    throw Object.assign(new Error("This invite has already been used to confirm a slot."), {
      statusCode: 409,
      existingBookingId: existing._id.toString(),
    });

  if (!mongoose.Types.ObjectId.isValid(slotId)) throw new Error("Invalid slot.");
  const slot = await SpeakerSlot.findById(slotId).populate("dayId");
  if (!slot) throw new Error("Invalid slot.");
  if (slot.eventId.toString() !== invite.eventId._id.toString())
    throw new Error("This slot does not belong to your invite's event.");

  const bookedCount = await SpeakerBooking.countDocuments({ slotId, status: "confirmed" });
  if (bookedCount >= (slot.capacity || 1))
    throw Object.assign(new Error("This slot is no longer available."), { statusCode: 409 });

  const booking = await SpeakerBooking.create({
    slotId: slot._id,
    inviteId: invite._id,
    fullName,
    email,
    xHandle: xHandle.startsWith("@") ? xHandle : `@${xHandle}`,
    bioLink: bioLink || "",
    topicAngle: topicAngle || "",
    phone: phone || "",
    status: "confirmed",
  });

  const date = slot.dayId?.date || "";
  const timeWAT = `${slot.startTime} WAT`;
  const firstName = fullName.trim().split(/\s+/)[0] || fullName;

  try {
    const speakerHtml = speakerSlotConfirmationTemplate({
      firstName,
      date,
      timeWAT,
      theme: slot.theme,
      sessionType: slot.sessionType || "keynote",
    });
    await sendEmail({
      to: email,
      subject: "Confirmed: Your Speaker Slot for the 72-Hour X Space",
      htmlbody: speakerHtml,
    });
  } catch (e) {
    console.error("Speaker confirmation email failed:", e);
  }

  try {
    const internalHtml = speakerSlotInternalNotificationTemplate({
      speakerName: fullName,
      xHandle: booking.xHandle,
      email: booking.email,
      date,
      timeWAT,
      theme: slot.theme,
      topicAngle: booking.topicAngle,
    });
    const subject = `New Speaker Slot Confirmed – ${fullName} (${slot.theme})`;
    for (const to of getNotifyEmails()) {
      try {
        await sendEmail({ to, subject, htmlbody: internalHtml });
      } catch (e) {
        console.error(`Internal notification email failed for ${to}:`, e.message);
      }
    }
  } catch (e) {
    console.error("Internal notification email failed:", e);
  }

  return {
    bookingId: booking._id,
    slot: {
      id: slot._id,
      date,
      startTimeWAT: timeWAT,
      endTimeWAT: `${slot.endTime} WAT`,
      theme: slot.theme,
      sessionType: slot.sessionType || "keynote",
    },
    speaker: {
      fullName: booking.fullName,
      email: booking.email,
      xHandle: booking.xHandle,
      topicAngle: booking.topicAngle,
    },
    confirmationEmailSent: true,
    calendarIcsUrl: `/api/speaker-slots/booking/${booking._id}/ics`,
  };
}

export async function getBookingForConfirm(bookingId) {
  const booking = await SpeakerBooking.findById(bookingId)
    .populate({ path: "slotId", populate: { path: "dayId" } })
    .lean();
  if (!booking || booking.status !== "confirmed") return null;
  const slot = booking.slotId;
  if (!slot) return null;
  return {
    bookingId: booking._id,
    slot: {
      date: slot.dayId?.date,
      startTimeWAT: `${slot.startTime} WAT`,
      endTimeWAT: `${slot.endTime} WAT`,
      theme: slot.theme,
      sessionType: slot.sessionType || "keynote",
    },
    speaker: {
      fullName: booking.fullName,
      email: booking.email,
      xHandle: booking.xHandle,
      topicAngle: booking.topicAngle,
    },
  };
}
