import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import SpeakerEvent from "../../models/SpeakerSlots/SpeakerEvent.js";
import SpeakerEventDay from "../../models/SpeakerSlots/SpeakerEventDay.js";
import SpeakerSlot from "../../models/SpeakerSlots/SpeakerSlot.js";
import SpeakerInvite from "../../models/SpeakerSlots/SpeakerInvite.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_SEED = {
    event: { name: "72-Hour X Space", slug: "72hr-x-space" },
    days: [
        { id: "day1", name: "Day 1", theme: "People Focus", date: "2026-05-01" },
        { id: "day2", name: "Day 2", theme: "People Power", date: "2026-05-02" },
        { id: "day3", name: "Day 3", theme: "People Protest", date: "2026-05-03" },
    ],
    slots: [
        { dayId: "day1", startTime: "09:00", endTime: "11:00", theme: "People Focus", capacity: 6, sessionType: "panel" },
        { dayId: "day1", startTime: "11:00", endTime: "13:00", theme: "People Focus", capacity: 6, sessionType: "panel" },
        { dayId: "day2", startTime: "09:00", endTime: "11:00", theme: "People Power", capacity: 6, sessionType: "panel" },
        { dayId: "day2", startTime: "11:00", endTime: "13:00", theme: "People Power", capacity: 6, sessionType: "panel" },
        { dayId: "day3", startTime: "10:00", endTime: "12:00", theme: "People Protest", capacity: 6, sessionType: "panel" },
        { dayId: "day3", startTime: "15:00", endTime: "17:00", theme: "People Protest", capacity: 6, sessionType: "panel" },
    ],
};
export function loadSeedData() {
    try {
        const p = path.join(__dirname, "speaker-slots-seed-data.json");
        const raw = readFileSync(p, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return FALLBACK_SEED;
    }
}
/** Create slots from seed data; dayIdMap maps seed day id to MongoDB day _id. */
async function createSlotsFromSeed(eventId, slots, dayIdMap) {
    if (!slots || slots.length === 0)
        return;
    const slotsToInsert = slots
        .map((s) => {
        const dayId = dayIdMap[s.dayId];
        if (!dayId)
            return null;
        return {
            eventId,
            dayId,
            startTime: s.startTime,
            endTime: s.endTime,
            theme: s.theme,
            capacity: s.capacity ?? 1,
            sessionType: s.sessionType || "keynote",
        };
    })
        .filter(Boolean);
    if (slotsToInsert.length)
        await SpeakerSlot.insertMany(slotsToInsert);
}
/** Ensure at least one invite exists for the event (for speaker booking link). */
async function ensureOneInvite(eventId) {
    const existing = await SpeakerInvite.findOne({ eventId });
    if (existing)
        return existing;
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const invite = await SpeakerInvite.create({
        token: SpeakerInvite.generateToken(),
        eventId,
        expiresAt,
    });
    const baseUrl = process.env.FRONTEND_URL ||
        process.env.BACKEND_URL ||
        "http://localhost:3000";
    const bookingPath = "/book";
    const link = `${baseUrl.replace(/\/$/, "")}${bookingPath}?token=${invite.token}`;
    console.log("Speaker booking link (share with speakers):", link);
    return invite;
}
/**
 * One-time event: ensures all data from seed exists — event, days (with themes), slots, and at least one invite.
 * Call after DB is connected (e.g. on mongoose 'connected' or at startup).
 */
export async function ensureDefaultSpeakerEvent() {
    try {
        const seed = loadSeedData();
        const { event: eventSeed, days: daysSeed, slots: slotsSeed } = seed;
        let event = (await SpeakerEvent.findOne({
            $or: [{ slug: eventSeed.slug }, { name: eventSeed.name }],
        }).lean());
        if (!event) {
            const createdEvent = (await SpeakerEvent.create(eventSeed));
            event = {
                _id: createdEvent._id,
                name: createdEvent.name,
                slug: createdEvent.slug ?? null,
            };
            const daysInserted = await SpeakerEventDay.insertMany(daysSeed.map((d, i) => ({
                eventId: createdEvent._id,
                label: d.name,
                date: d.date,
                theme: d.theme,
                sortOrder: i + 1,
            })));
            const dayIdMap = {};
            daysSeed.forEach((d, i) => {
                dayIdMap[d.id] = daysInserted[i]._id;
            });
            await createSlotsFromSeed(createdEvent._id, slotsSeed, dayIdMap);
            await ensureOneInvite(createdEvent._id);
            console.log("72-Hour X Space: event, days, slots, and invite created from seed.");
            return event;
        }
        const days = (await SpeakerEventDay.find({ eventId: event._id })
            .sort({ sortOrder: 1 })
            .lean());
        const slotCount = await SpeakerSlot.countDocuments({
            eventId: event._id,
        });
        if (days.length === 0) {
            const daysInserted = await SpeakerEventDay.insertMany(daysSeed.map((d, i) => ({
                eventId: event._id,
                label: d.name,
                date: d.date,
                theme: d.theme,
                sortOrder: i + 1,
            })));
            const dayIdMap = {};
            daysSeed.forEach((d, i) => {
                dayIdMap[d.id] = daysInserted[i]._id;
            });
            await createSlotsFromSeed(event._id, slotsSeed, dayIdMap);
            console.log("72-Hour X Space: days and slots added from seed.");
        }
        else if (slotCount === 0) {
            const dayIdMap = {};
            for (const d of daysSeed) {
                const found = days.find((db) => db.theme === d.theme && db.date === d.date);
                if (found)
                    dayIdMap[d.id] = found._id;
            }
            await createSlotsFromSeed(event._id, slotsSeed, dayIdMap);
            console.log("72-Hour X Space: slots added from seed.");
        }
        await ensureOneInvite(event._id);
        return event;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Seed speaker event failed:", message);
        return null;
    }
}
//# sourceMappingURL=seedSpeakerEvent.js.map