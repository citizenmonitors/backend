import SpeakerEvent from "../../models/SpeakerSlots/SpeakerEvent.js";
import SpeakerEventDay from "../../models/SpeakerSlots/SpeakerEventDay.js";
import SpeakerSlot from "../../models/SpeakerSlots/SpeakerSlot.js";
import SpeakerBooking from "../../models/SpeakerSlots/SpeakerBooking.js";
import SpeakerInvite from "../../models/SpeakerSlots/SpeakerInvite.js";
import mongoose from "mongoose";

export async function getEvents() {
  const events = await SpeakerEvent.find().sort({ createdAt: -1 }).lean();
  return events.map((e) => ({ id: e._id, name: e.name, slug: e.slug }));
}

export async function getSchedule(eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) return null;
  const event = await SpeakerEvent.findById(eventId).lean();
  if (!event) return null;

  const days = await SpeakerEventDay.find({ eventId }).sort({ sortOrder: 1 }).lean();
  const dayIds = days.map((d) => d._id);
  const slots = await SpeakerSlot.find({ eventId, dayId: { $in: dayIds } })
    .populate("dayId")
    .sort({ "dayId.sortOrder": 1, startTime: 1 })
    .lean();

  const bookings = await SpeakerBooking.find({
    slotId: { $in: slots.map((s) => s._id) },
    status: "confirmed",
  })
    .populate("slotId")
    .lean();

  const bookingsBySlot = {};
  for (const b of bookings) {
    const sid = b.slotId?._id?.toString();
    if (!sid) continue;
    if (!bookingsBySlot[sid]) bookingsBySlot[sid] = [];
    bookingsBySlot[sid].push({
      bookingId: b._id,
      fullName: b.fullName,
      email: b.email,
      xHandle: b.xHandle,
      topicAngle: b.topicAngle,
      bioLink: b.bioLink,
      phone: b.phone,
    });
  }

  const schedule = days.map((day) => {
    const daySlots = slots.filter((s) => s.dayId && s.dayId._id.toString() === day._id.toString());
    return {
      day: { id: day._id, name: day.label, label: day.label, date: day.date, theme: day.theme },
      slots: daySlots.map((s) => {
        const slotBookings = bookingsBySlot[s._id.toString()] || [];
        return {
          id: s._id,
          dayId: s.dayId?._id,
          startTime: s.startTime,
          endTime: s.endTime,
          theme: s.theme,
          capacity: s.capacity,
          sessionType: s.sessionType,
          bookedCount: slotBookings.length,
          bookings: slotBookings,
        };
      }),
    };
  });

  return { event, days, schedule };
}

/**
 * Get all confirmed speaker bookings for an event (flat list for admin).
 */
export async function getConfirmedBookings(eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) return null;
  const event = await SpeakerEvent.findById(eventId).lean();
  if (!event) return null;

  const slots = await SpeakerSlot.find({ eventId }).populate("dayId").lean();
  const slotIds = slots.map((s) => s._id);

  const bookings = await SpeakerBooking.find({
    slotId: { $in: slotIds },
    status: "confirmed",
  })
    .populate("slotId")
    .lean();

  const list = bookings.map((b) => {
    const slot = b.slotId;
    const day = slot?.dayId;
    return {
      bookingId: b._id,
      slotId: slot?._id,
      slot: {
        date: day?.date || "",
        startTime: slot?.startTime || "",
        endTime: slot?.endTime || "",
        startTimeWAT: slot?.startTime ? `${slot.startTime} WAT` : "",
        endTimeWAT: slot?.endTime ? `${slot.endTime} WAT` : "",
        theme: slot?.theme || "",
        sessionType: slot?.sessionType || "keynote",
        capacity: slot?.capacity,
      },
      speaker: {
        fullName: b.fullName,
        email: b.email,
        xHandle: b.xHandle,
        topicAngle: b.topicAngle,
        bioLink: b.bioLink,
        phone: b.phone,
      },
      createdAt: b.createdAt,
    };
  });

  list.sort((a, b) => {
    const dateCmp = (a.slot?.date || "").localeCompare(b.slot?.date || "");
    if (dateCmp !== 0) return dateCmp;
    return (a.slot?.startTime || "").localeCompare(b.slot?.startTime || "");
  });

  return { event: { id: event._id, name: event.name }, bookings: list };
}

export async function exportScheduleCsv(eventId) {
  const data = await getSchedule(eventId);
  if (!data) return null;

  const rows = [
    ["Day", "Date", "Theme", "Time (WAT)", "Session Type", "Speaker", "Email", "X Handle", "Topic/Angle"],
  ];
  for (const { day, slots } of data.schedule) {
    for (const slot of slots) {
      const timeRange = `${slot.startTime} - ${slot.endTime}`;
      if (slot.bookings.length === 0) {
        rows.push([day.label, day.date, day.theme, timeRange, slot.sessionType || "", "", "", "", ""]);
      } else {
        for (const b of slot.bookings) {
          rows.push([
            day.label,
            day.date,
            day.theme,
            timeRange,
            slot.sessionType || "",
            b.fullName,
            b.email,
            b.xHandle,
            b.topicAngle || "",
          ]);
        }
      }
    }
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  return csv;
}

export async function moveBooking(bookingId, updates) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) return null;
  const booking = await SpeakerBooking.findById(bookingId);
  if (!booking) return null;

  if (updates.slotId) {
    if (!mongoose.Types.ObjectId.isValid(updates.slotId)) return null;
    const newSlot = await SpeakerSlot.findById(updates.slotId);
    if (!newSlot) return null;
    const count = await SpeakerBooking.countDocuments({ slotId: newSlot._id, status: "confirmed" });
    if (count >= (newSlot.capacity || 1)) throw new Error("Target slot is full.");
    booking.slotId = newSlot._id;
  }
  if (updates.status) booking.status = updates.status;
  await booking.save();
  return booking;
}

export async function createSlots(eventId, slotsPayload) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) return null;
  const event = await SpeakerEvent.findById(eventId);
  if (!event) return null;

  const created = [];
  for (const s of slotsPayload) {
    const { dayId, startTime, endTime, theme, capacity, sessionType } = s;
    if (!dayId || !startTime || !endTime || !theme) continue;
    const slot = await SpeakerSlot.create({
      eventId,
      dayId,
      startTime,
      endTime,
      theme,
      capacity: capacity ?? 1,
      sessionType: sessionType || "keynote",
    });
    created.push(slot);
  }
  return created;
}

export async function getSlots(eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) return [];
  const slots = await SpeakerSlot.find({ eventId }).populate("dayId").sort({ "dayId.sortOrder": 1, startTime: 1 }).lean();
  return slots;
}

export async function createInvites(eventId, count = 1, expiresAt) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) return null;
  const event = await SpeakerEvent.findById(eventId);
  if (!event) return null;

  const expires = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const tokens = [];
  for (let i = 0; i < count; i++) {
    const token = SpeakerInvite.generateToken();
    await SpeakerInvite.create({ token, eventId, expiresAt: expires });
    tokens.push({ token, link: `/book?token=${token}` });
  }
  return tokens;
}

/** Cancel/delete a booking (frees the slot for others). */
export async function deleteBooking(bookingId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) return null;
  const booking = await SpeakerBooking.findById(bookingId);
  if (!booking) return null;
  booking.status = "cancelled";
  await booking.save();
  return booking;
}

/** Delete a slot. Any confirmed bookings on that slot are set to cancelled. */
export async function deleteSlot(slotId) {
  if (!mongoose.Types.ObjectId.isValid(slotId)) return null;
  const slot = await SpeakerSlot.findById(slotId);
  if (!slot) return null;
  await SpeakerBooking.updateMany(
    { slotId: slot._id, status: "confirmed" },
    { $set: { status: "cancelled" } }
  );
  await SpeakerSlot.findByIdAndDelete(slotId);
  return { deleted: true, slotId };
}
