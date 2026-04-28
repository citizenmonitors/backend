type ReminderError = {
    bookingId: unknown;
    message: string;
};
type ReminderResults = {
    sent7d: number;
    sent24h: number;
    sent2h: number;
    errors: ReminderError[];
};
/**
 * Send due reminder emails for confirmed speaker bookings.
 * Call from cron or admin endpoint (e.g. every hour).
 */
export declare function sendDueReminders(): Promise<ReminderResults>;
export {};
//# sourceMappingURL=speakerReminderService.d.ts.map