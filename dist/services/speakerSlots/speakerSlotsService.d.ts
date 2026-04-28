import type { Types } from "mongoose";
type Id = string | Types.ObjectId;
type InviteValidationResult = {
    valid: false;
    code: "invalid" | "expired";
} | {
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
export declare function getInviteByToken(token: string): Promise<InviteValidationResult>;
export declare function bookSlot(data: {
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
}>;
export declare function getBookingForConfirm(bookingId: Id): Promise<{
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
} | null>;
export {};
//# sourceMappingURL=speakerSlotsService.d.ts.map