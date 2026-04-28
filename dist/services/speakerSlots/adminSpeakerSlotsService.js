import SpeakerEvent from "../../models/SpeakerSlots/SpeakerEvent.js";
import SpeakerEventDay from "../../models/SpeakerSlots/SpeakerEventDay.js";
import SpeakerSlot from "../../models/SpeakerSlots/SpeakerSlot.js";
import SpeakerBooking from "../../models/SpeakerSlots/SpeakerBooking.js";
import SpeakerInvite from "../../models/SpeakerSlots/SpeakerInvite.js";
import mongoose from "mongoose";
/** Normalize frontend date to YYYY-MM-DD (ISO date string, timestamp, or date-only). */
function normalizeDateToYYYYMMDD(value) {
    if (value == null || value === "")
        return "";
    if (typeof value === "number") {
        const d = new Date(value);
        return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    }
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s))
        return s;
    const d = new Date(s);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}
export async function getEvents() {
    const events = (await SpeakerEvent.find()
        .sort({ createdAt: -1 })
        .lean());
    return events.map((e) => ({ id: e._id, name: e.name, slug: e.slug }));
}
/** List days for an event (so admin can pick/edit date per day). */
export async function getDays(eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId))
        return null;
    const event = await SpeakerEvent.findById(eventId).lean();
    if (!event)
        return null;
    const days = (await SpeakerEventDay.find({ eventId })
        .sort({ sortOrder: 1 })
        .lean());
    return days.map((d) => ({
        id: d._id,
        label: d.label,
        name: d.label,
        date: d.date,
        theme: d.theme,
        description: d.description || "",
        sortOrder: d.sortOrder,
    }));
}
/** Create a day for an event (admin picks date, label, theme). */
export async function createDay(eventId, body) {
    if (!mongoose.Types.ObjectId.isValid(eventId))
        return null;
    const event = await SpeakerEvent.findById(eventId);
    if (!event)
        return null;
    const { date, label, theme, description, sortOrder } = body;
    if (!date || !label || !theme)
        return null;
    const dateStr = normalizeDateToYYYYMMDD(date);
    if (!dateStr)
        throw new Error("Invalid date format.");
    const maxOrder = (await SpeakerEventDay.findOne({ eventId })
        .sort({ sortOrder: -1 })
        .select("sortOrder")
        .lean());
    const nextOrder = (maxOrder?.sortOrder ?? 0) + 1;
    const day = await SpeakerEventDay.create({
        eventId,
        label: String(label),
        date: dateStr,
        theme: String(theme),
        description: description != null ? String(description) : "",
        sortOrder: sortOrder != null ? Number(sortOrder) : nextOrder,
    });
    return day;
}
/** Update a day (e.g. set date so admin can pick a date). */
export async function updateDay(eventId, dayId, updates) {
    if (!mongoose.Types.ObjectId.isValid(eventId) ||
        !mongoose.Types.ObjectId.isValid(dayId))
        return null;
    const day = await SpeakerEventDay.findOne({ _id: dayId, eventId });
    if (!day)
        return null;
    if (updates.date != null) {
        const dateStr = normalizeDateToYYYYMMDD(updates.date);
        if (!dateStr)
            throw new Error("Invalid date format.");
        day.date = dateStr;
    }
    if (updates.label != null)
        day.label = String(updates.label);
    if (updates.theme != null)
        day.theme = String(updates.theme);
    if (updates.description != null)
        day.description = String(updates.description);
    if (updates.sortOrder != null)
        day.sortOrder = Number(updates.sortOrder);
    await day.save();
    return day;
}
export async function getSchedule(eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId))
        return null;
    const event = await SpeakerEvent.findById(eventId).lean();
    if (!event)
        return null;
    const days = (await SpeakerEventDay.find({ eventId })
        .sort({ sortOrder: 1 })
        .lean());
    const dayIds = days.map((d) => d._id);
    const slots = (await SpeakerSlot.find({
        eventId,
        dayId: { $in: dayIds },
    })
        .populate("dayId")
        .sort({ "dayId.sortOrder": 1, startTime: 1 })
        .lean());
    const bookings = (await SpeakerBooking.find({
        slotId: { $in: slots.map((s) => s._id) },
        status: "confirmed",
    })
        .populate("slotId")
        .lean());
    const bookingsBySlot = {};
    for (const b of bookings) {
        const sid = b.slotId?._id?.toString();
        if (!sid)
            continue;
        if (!bookingsBySlot[sid])
            bookingsBySlot[sid] = [];
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
            day: {
                id: day._id,
                name: day.label,
                label: day.label,
                date: day.date,
                theme: day.theme,
            },
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
    if (!mongoose.Types.ObjectId.isValid(eventId))
        return null;
    const event = (await SpeakerEvent.findById(eventId).lean());
    if (!event)
        return null;
    const slots = (await SpeakerSlot.find({ eventId })
        .populate("dayId")
        .lean());
    const slotIds = slots.map((s) => s._id);
    const bookings = (await SpeakerBooking.find({
        slotId: { $in: slotIds },
        status: "confirmed",
    })
        .populate("slotId")
        .lean());
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
        if (dateCmp !== 0)
            return dateCmp;
        return (a.slot?.startTime || "").localeCompare(b.slot?.startTime || "");
    });
    return { event: { id: event._id, name: event.name }, bookings: list };
}
export async function exportScheduleCsv(eventId) {
    const data = (await getSchedule(eventId));
    if (!data)
        return null;
    const rows = [
        [
            "Day",
            "Date",
            "Theme",
            "Time (WAT)",
            "Session Type",
            "Speaker",
            "Email",
            "X Handle",
            "Topic/Angle",
        ],
    ];
    for (const { day, slots } of data.schedule) {
        for (const slot of slots) {
            const timeRange = `${slot.startTime} - ${slot.endTime}`;
            if (slot.bookings.length === 0) {
                rows.push([
                    day.label,
                    day.date,
                    day.theme,
                    timeRange,
                    slot.sessionType || "",
                    "",
                    "",
                    "",
                    "",
                ]);
            }
            else {
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
    const csv = rows
        .map((r) => r
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","))
        .join("\n");
    return csv;
}
export async function moveBooking(bookingId, updates) {
    if (!mongoose.Types.ObjectId.isValid(bookingId))
        return null;
    const booking = await SpeakerBooking.findById(bookingId);
    if (!booking)
        return null;
    if (updates.slotId) {
        const slotId = String(updates.slotId);
        if (!mongoose.Types.ObjectId.isValid(slotId))
            return null;
        const newSlot = await SpeakerSlot.findById(slotId);
        if (!newSlot)
            return null;
        const count = await SpeakerBooking.countDocuments({
            slotId: newSlot._id,
            status: "confirmed",
        });
        if (count >= (newSlot.capacity || 1))
            throw new Error("Target slot is full.");
        booking.slotId = newSlot._id;
    }
    if (updates.status) {
        const status = String(updates.status);
        if (status === "confirmed" || status === "cancelled" || status === "pending") {
            booking.status = status;
        }
    }
    await booking.save();
    return booking;
}
export async function createSlots(eventId, slotsPayload) {
    if (!mongoose.Types.ObjectId.isValid(eventId))
        return null;
    const event = await SpeakerEvent.findById(eventId);
    if (!event)
        return null;
    const created = [];
    for (const s of slotsPayload) {
        const { dayId, date, label, theme, startTime, endTime, capacity, sessionType, } = s;
        if (!startTime || !endTime || !theme)
            continue;
        let resolvedDayId = dayId;
        if (!resolvedDayId && date != null && label != null) {
            const dateStr = normalizeDateToYYYYMMDD(date);
            if (!dateStr)
                throw new Error("Invalid date format.");
            const day = (await SpeakerEventDay.findOne({
                eventId,
                date: dateStr,
                label: String(label),
                theme: String(theme),
            }).lean());
            if (!day) {
                const maxOrder = (await SpeakerEventDay.findOne({ eventId })
                    .sort({ sortOrder: -1 })
                    .select("sortOrder")
                    .lean());
                const nextOrder = (maxOrder?.sortOrder ?? 0) + 1;
                const newDay = await SpeakerEventDay.create({
                    eventId,
                    label: String(label),
                    date: dateStr,
                    theme: String(theme),
                    description: "",
                    sortOrder: nextOrder,
                });
                resolvedDayId = newDay._id;
            }
            else {
                resolvedDayId = day._id;
            }
        }
        if (!resolvedDayId)
            continue;
        const slot = await SpeakerSlot.create({
            eventId,
            dayId: resolvedDayId,
            startTime: String(startTime),
            endTime: String(endTime),
            theme: String(theme),
            capacity: capacity ?? 1,
            sessionType: sessionType || "panel",
        });
        created.push(slot);
    }
    if (created.length > 0) {
        const hasInvite = await SpeakerInvite.exists({ eventId });
        if (!hasInvite) {
            const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
            await SpeakerInvite.create({
                token: SpeakerInvite.generateToken(),
                eventId,
                expiresAt,
            });
        }
    }
    return created;
}
export async function getSlots(eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId))
        return [];
    const slots = await SpeakerSlot.find({ eventId })
        .populate("dayId")
        .sort({ "dayId.sortOrder": 1, startTime: 1 })
        .lean();
    return slots;
}
export async function createInvites(eventId, count = 1, expiresAt) {
    if (!mongoose.Types.ObjectId.isValid(eventId))
        return null;
    const event = await SpeakerEvent.findById(eventId);
    if (!event)
        return null;
    const expires = expiresAt instanceof Date
        ? expiresAt
        : typeof expiresAt === "string" || typeof expiresAt === "number"
            ? new Date(expiresAt)
            : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
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
    if (!mongoose.Types.ObjectId.isValid(bookingId))
        return null;
    const booking = await SpeakerBooking.findById(bookingId);
    if (!booking)
        return null;
    booking.status = "cancelled";
    await booking.save();
    return booking;
}
/** Delete a slot. Any confirmed bookings on that slot are set to cancelled. */
export async function deleteSlot(slotId) {
    if (!mongoose.Types.ObjectId.isValid(slotId))
        return null;
    const slot = await SpeakerSlot.findById(slotId);
    if (!slot)
        return null;
    await SpeakerBooking.updateMany({ slotId: slot._id, status: "confirmed" }, { $set: { status: "cancelled" } });
    await SpeakerSlot.findByIdAndDelete(slotId);
    return { deleted: true, slotId };
}
//# sourceMappingURL=adminSpeakerSlotsService.js.map