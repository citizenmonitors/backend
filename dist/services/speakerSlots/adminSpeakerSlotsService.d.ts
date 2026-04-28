import type { Types } from "mongoose";
type Id = string | Types.ObjectId;
export declare function getEvents(): Promise<unknown[]>;
/** List days for an event (so admin can pick/edit date per day). */
export declare function getDays(eventId: Id): Promise<unknown[] | null>;
/** Create a day for an event (admin picks date, label, theme). */
export declare function createDay(eventId: Id, body: {
    date?: unknown;
    label?: unknown;
    theme?: unknown;
    description?: unknown;
    sortOrder?: unknown;
}): Promise<unknown | null>;
/** Update a day (e.g. set date so admin can pick a date). */
export declare function updateDay(eventId: Id, dayId: Id, updates: {
    date?: unknown;
    label?: unknown;
    theme?: unknown;
    description?: unknown;
    sortOrder?: unknown;
}): Promise<unknown | null>;
export declare function getSchedule(eventId: Id): Promise<unknown | null>;
/**
 * Get all confirmed speaker bookings for an event (flat list for admin).
 */
export declare function getConfirmedBookings(eventId: Id): Promise<unknown | null>;
export declare function exportScheduleCsv(eventId: Id): Promise<string | null>;
export declare function moveBooking(bookingId: Id, updates: {
    slotId?: unknown;
    status?: unknown;
}): Promise<unknown | null>;
export declare function createSlots(eventId: Id, slotsPayload: Array<{
    dayId?: Id;
    date?: unknown;
    label?: unknown;
    theme?: unknown;
    startTime?: unknown;
    endTime?: unknown;
    capacity?: unknown;
    sessionType?: unknown;
}>): Promise<unknown[] | null>;
export declare function getSlots(eventId: Id): Promise<unknown[]>;
export declare function createInvites(eventId: Id, count: number | undefined, expiresAt: unknown): Promise<Array<{
    token: string;
    link: string;
}> | null>;
/** Cancel/delete a booking (frees the slot for others). */
export declare function deleteBooking(bookingId: Id): Promise<unknown | null>;
/** Delete a slot. Any confirmed bookings on that slot are set to cancelled. */
export declare function deleteSlot(slotId: Id): Promise<{
    deleted: true;
    slotId: Id;
} | null>;
export {};
//# sourceMappingURL=adminSpeakerSlotsService.d.ts.map