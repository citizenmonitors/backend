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
import type { Types } from "mongoose";

const DEFAULT_NOTIFY_EMAILS: string[] = [
  "olajumoke@citizenmonitors.com",
  "adeshope@citizenmonitors.com",
  "yunus@citizenmonitors.com",
];

function getNotifyEmails(): string[] {
  const env = process.env.SPEAKER_SLOT_NOTIFY_EMAILS;
  if (env && typeof env === "string") {
    return env.split(",").map((e) => e.trim()).filter(Boolean);
  }
  return DEFAULT_NOTIFY_EMAILS;
}

const FEW_SPOTS_LEFT_THRESHOLD = 2;
type Id = string | Types.ObjectId;
type SessionType = "keynote" | "panel";
type InviteValidationResult =
  | { valid: false; code: "invalid" | "expired" }
  | {
      valid: true;
      invite: {
        token: string;
        eventId: string;
        eventName: string;
        expiresAt: Date;
      };
      days: Array<{
        id: string;
        label: string;
        name: string;
        date: string;
        theme: string;
        sortOrder: number;
      }>;
      slots: Array<{
        id: string;
        dayId: string;
        date: string;
        theme: string;
        startTime: string;
        endTime: string;
        startTimeWAT: string;
        endTimeWAT: string;
        capacity: number;
        bookedCount: number;
        status: "full" | "few_left" | "available";
        sessionType: string;
        isYourSlot: boolean;
      }>;
      schedule: Array<{
        day: {
          id: string;
          label: string;
          name: string;
          date: string;
          theme: string;
          sortOrder: number;
        };
        slots: Array<{
          id: string;
          dayId: string;
          date: string;
          theme: string;
          startTime: string;
          endTime: string;
          startTimeWAT: string;
          endTimeWAT: string;
          capacity: number;
          bookedCount: number;
          status: "full" | "few_left" | "available";
          sessionType: string;
          isYourSlot: boolean;
        }>;
      }>;
      existingBooking: {
        bookingId: string;
        slotId?: string;
        slot: null | {
          date: string;
          startTimeWAT: string;
          theme: string;
          sessionType: string;
        };
      } | null;
    };

type SpeakerInviteLean = {
  _id: Types.ObjectId;
  token: string;
  expiresAt: Date;
  eventId?: { _id: Types.ObjectId } | Types.ObjectId;
};
type SpeakerEventLean = { _id: Types.ObjectId; name: string };
type SpeakerDayLean = {
  _id: Types.ObjectId;
  label: string;
  date: string;
  theme: string;
  sortOrder: number;
};
type PopulatedDayRef = { _id: Types.ObjectId; date?: string };
type SlotLean = {
  _id: Types.ObjectId;
  dayId?: PopulatedDayRef | Types.ObjectId;
  startTime: string;
  endTime: string;
  theme: string;
  capacity?: number;
  sessionType?: string;
};
type BookingLean = {
  _id: Types.ObjectId;
  slotId?: (SlotLean & { dayId?: { date?: string } | Types.ObjectId }) | Types.ObjectId;
  fullName: string;
  email: string;
  xHandle: string;
  topicAngle: string;
  status: string;
};

const getRefObjectId = (
  ref: { _id?: Types.ObjectId } | Types.ObjectId | undefined
): Types.ObjectId | undefined => {
  if (!ref) return undefined;
  if (ref instanceof mongoose.Types.ObjectId) return ref;
  return ref._id;
};

const getSlotDayId = (slot: SlotLean): string => {
  if (!slot.dayId) return "";
  if (slot.dayId instanceof mongoose.Types.ObjectId) return slot.dayId.toString();
  return slot.dayId._id.toString();
};

const getSlotDayDate = (slot: SlotLean): string => {
  if (!slot.dayId || slot.dayId instanceof mongoose.Types.ObjectId) return "";
  return slot.dayId.date ?? "";
};

const isSlotDoc = (slot: BookingLean["slotId"]): slot is SlotLean =>
  Boolean(slot && typeof slot === "object" && "_id" in slot && "startTime" in slot);

function slotStatus(
  bookedCount: number,
  capacity: number
): "full" | "few_left" | "available" {
  if (bookedCount >= capacity) return "full";
  if (capacity - bookedCount <= FEW_SPOTS_LEFT_THRESHOLD) return "few_left";
  return "available";
}

export async function getInviteByToken(token: string): Promise<InviteValidationResult> {
  const invite = (await SpeakerInvite.findOne({ token })
    .populate("eventId")
    .lean()) as SpeakerInviteLean | null;
  if (!invite) return { valid: false, code: "invalid" };
  if (new Date(invite.expiresAt) < new Date())
    return { valid: false, code: "expired" };

  const eventId = getRefObjectId(invite.eventId);
  if (!eventId) return { valid: false, code: "invalid" };

  const event = (await SpeakerEvent.findById(eventId).lean()) as SpeakerEventLean | null;
  if (!event) return { valid: false, code: "invalid" };

  const days = (await SpeakerEventDay.find({ eventId })
    .sort({ sortOrder: 1 })
    .lean()) as SpeakerDayLean[];

  // All slots for this event — list every slot so speakers can pick one they're available for
  const allSlots = (await SpeakerSlot.find({ eventId })
    .populate("dayId")
    .lean()) as SlotLean[];

  // Sort by day order then start time (so list order matches schedule)
  const dayOrder = Object.fromEntries(
    days.map((d, i) => [d._id.toString(), i])
  ) as Record<string, number>;

  allSlots.sort((a, b) => {
    const aDayId = getSlotDayId(a);
    const bDayId = getSlotDayId(b);
    const dayDiff = (dayOrder[aDayId] ?? 99) - (dayOrder[bDayId] ?? 99);
    if (dayDiff !== 0) return dayDiff;
    return (a.startTime || "").localeCompare(b.startTime || "");
  });

  const bookingCounts = (await SpeakerBooking.aggregate([
    {
      $match: {
        slotId: { $in: allSlots.map((s) => s._id) },
        status: "confirmed",
      },
    },
    { $group: { _id: "$slotId", count: { $sum: 1 } } },
  ])) as Array<{ _id: Types.ObjectId; count: number }>;

  const countBySlot: Record<string, number> = Object.fromEntries(
    bookingCounts.map((b) => [b._id.toString(), b.count])
  );

  const existingBooking = (await SpeakerBooking.findOne({
    inviteId: invite._id,
    status: "confirmed",
  })
    .populate("slotId")
    .lean()) as BookingLean | null;

  const slotList = allSlots.map((s) => {
    const bookedCount = countBySlot[s._id.toString()] || 0;
    const cap = s.capacity || 1;
    const isYourSlot =
      !!existingBooking &&
      isSlotDoc(existingBooking.slotId) &&
      existingBooking.slotId._id.toString() === s._id.toString();

    return {
      id: s._id.toString(),
      dayId: getSlotDayId(s),
      date: getSlotDayDate(s),
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
    slots: slotList.filter(
      (s) => s.dayId === d._id.toString()
    ),
  }));

  const existingPayload = existingBooking
    ? {
        bookingId: existingBooking._id.toString(),
        slotId: isSlotDoc(existingBooking.slotId)
          ? existingBooking.slotId._id.toString()
          : undefined,
        slot: isSlotDoc(existingBooking.slotId)
          ? {
              date: getSlotDayDate(existingBooking.slotId),
              startTimeWAT: `${existingBooking.slotId.startTime} WAT`,
              theme: existingBooking.slotId.theme,
              sessionType:
                existingBooking.slotId.sessionType || "keynote",
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

export async function bookSlot(data: {
  inviteToken: string;
  slotId: string;
  fullName: string;
  email: string;
  xHandle: string;
  bioLink?: string;
  topicAngle?: string;
  phone?: string;
}): Promise<{
  bookingId: Types.ObjectId;
  slot: {
    id: Types.ObjectId;
    date: string;
    startTimeWAT: string;
    endTimeWAT: string;
    theme: string;
    sessionType: string;
  };
  speaker: {
    fullName: string;
    email: string;
    xHandle: string;
    topicAngle: string;
  };
  confirmationEmailSent: boolean;
  calendarIcsUrl: string;
}> {
  const {
    inviteToken,
    slotId,
    fullName,
    email,
    xHandle,
    bioLink,
    topicAngle,
    phone,
  } = data;

  const invite = (await SpeakerInvite.findOne({
    token: inviteToken,
  }).populate("eventId")) as SpeakerInviteLean | null;
  if (!invite)
    throw new Error("Invalid or expired invite link.");
  if (new Date(invite.expiresAt) < new Date())
    throw new Error("Invalid or expired invite link.");
  const inviteEventId = getRefObjectId(invite.eventId);
  if (!inviteEventId)
    throw new Error("Invalid or expired invite link.");

  const existing = (await SpeakerBooking.findOne({
    inviteId: invite._id,
    status: "confirmed",
  })) as BookingLean | null;
  if (existing)
    throw Object.assign(new Error("This invite has already been used to confirm a slot."), {
      statusCode: 409,
      existingBookingId: existing._id.toString(),
    });

  if (!mongoose.Types.ObjectId.isValid(slotId))
    throw new Error("Invalid slot.");
  const slot = (await SpeakerSlot.findById(slotId).populate("dayId")) as
    | (SlotLean & { eventId: Types.ObjectId; dayId?: { date?: string } | Types.ObjectId })
    | null;
  if (!slot) throw new Error("Invalid slot.");
  if (slot.eventId.toString() !== inviteEventId.toString())
    throw new Error("This slot does not belong to your invite's event.");

  const bookedCount: number = await SpeakerBooking.countDocuments({
    slotId,
    status: "confirmed",
  });
  if (bookedCount >= (slot.capacity || 1))
    throw Object.assign(
      new Error("This slot is no longer available."),
      { statusCode: 409 }
    );

  let booking: { _id: Types.ObjectId; xHandle: string; fullName: string; email: string; topicAngle: string };
  try {
    booking = (await SpeakerBooking.create({
      slotId: slot._id,
      inviteId: invite._id,
      fullName,
      email,
      xHandle: xHandle.startsWith("@") ? xHandle : `@${xHandle}`,
      bioLink: bioLink || "",
      topicAngle: topicAngle || "",
      phone: phone || "",
      status: "confirmed",
    })) as { _id: Types.ObjectId; xHandle: string; fullName: string; email: string; topicAngle: string };
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      e.code === 11000
    ) {
      const existingConfirmed = (await SpeakerBooking.findOne({
        inviteId: invite._id,
        status: "confirmed",
      })) as BookingLean | null;
      throw Object.assign(
        new Error("This invite has already been used to confirm a slot."),
        {
          statusCode: 409,
          existingBookingId: existingConfirmed?._id?.toString(),
        }
      );
    }
    throw e;
  }

  // Concurrency-safe cap guard: keep only earliest `capacity` confirmations.
  // If this booking falls into overflow under concurrent requests, remove it.
  const cap = slot.capacity || 1;
  const confirmedForSlot = await SpeakerBooking.find({
    slotId: slot._id,
    status: "confirmed",
  })
    .sort({ createdAt: 1, _id: 1 })
    .select("_id")
    .lean();
  if (confirmedForSlot.length > cap) {
    const overflowIds = confirmedForSlot.slice(cap).map((b) => b._id.toString());
    if (overflowIds.includes(booking._id.toString())) {
      await SpeakerBooking.deleteOne({ _id: booking._id });
      throw Object.assign(new Error("This slot is no longer available."), {
        statusCode: 409,
      });
    }
  }

  const date = getSlotDayDate(slot);
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
  } catch (e: unknown) {
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
      } catch (e: unknown) {
        console.error(
          `Internal notification email failed for ${to}:`,
          e instanceof Error ? e.message : e
        );
      }
    }
  } catch (e: unknown) {
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

export async function getBookingForConfirm(
  bookingId: Id
): Promise<{
  bookingId: Types.ObjectId;
  slot: {
    date?: string;
    startTimeWAT: string;
    endTimeWAT: string;
    theme: string;
    sessionType: string;
  };
  speaker: {
    fullName: string;
    email: string;
    xHandle: string;
    topicAngle: string;
  };
} | null> {
  const booking = (await SpeakerBooking.findById(bookingId)
    .populate({ path: "slotId", populate: { path: "dayId" } })
    .lean()) as BookingLean | null;
  if (!booking || booking.status !== "confirmed") return null;

  const slot = booking.slotId;
  if (!slot || !isSlotDoc(slot)) return null;

  return {
    bookingId: booking._id,
    slot: {
      date: getSlotDayDate(slot),
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

