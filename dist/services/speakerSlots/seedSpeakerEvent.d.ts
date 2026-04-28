import type { Types } from "mongoose";
type SeedDay = {
    id: string;
    name: string;
    theme: string;
    date: string;
};
type SeedSlot = {
    dayId: string;
    startTime: string;
    endTime: string;
    theme: string;
    capacity?: number;
    sessionType?: string;
};
type SeedEvent = {
    name: string;
    slug: string;
};
type SeedData = {
    event: SeedEvent;
    days: SeedDay[];
    slots: SeedSlot[];
};
type SeededEvent = {
    _id: Types.ObjectId;
    name: string;
    slug?: string | null;
};
export declare function loadSeedData(): SeedData;
/**
 * One-time event: ensures all data from seed exists — event, days (with themes), slots, and at least one invite.
 * Call after DB is connected (e.g. on mongoose 'connected' or at startup).
 */
export declare function ensureDefaultSpeakerEvent(): Promise<SeededEvent | null>;
export {};
//# sourceMappingURL=seedSpeakerEvent.d.ts.map