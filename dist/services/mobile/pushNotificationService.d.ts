import "../../config/firebaseConfig.ts";
export declare const isMobilePushEnabled: () => boolean;
export declare const isExpoPushToken: (token: string) => boolean;
/** Native FCM/APNs device tokens (not Expo's wrapper format). */
export declare const isFcmPushToken: (token: string) => boolean;
export declare const checkExpoReceipts: (receiptTokens: Map<string, string>) => Promise<{
    checked: number;
    removed: number;
}>;
export declare const sendPushToUserIds: (input: {
    userIds: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
}) => Promise<void>;
export declare const sendPushForMobileNotification: (input: {
    userIds: string[];
    notification: {
        _id: unknown;
        type?: string | null;
        preferenceKey?: string | null;
        body?: string | null;
        info?: string | null;
        articleSlug?: string | null;
        articleId?: string | null;
    };
}) => Promise<void>;
/**
 * Save the device's push token for this user (called on login / app start).
 * A token belongs to one device, so it's removed from any other account first:
 * otherwise a shared phone would keep getting the previous user's notifications.
 */
export declare const registerPushToken: (userId: string, input: {
    token?: unknown;
    platform?: unknown;
}) => Promise<{
    registered: boolean;
    platform: string | null;
}>;
/** Remove the token on logout. Idempotent; without a token, clears the user's token. */
export declare const unregisterPushToken: (userId: string, input: {
    token?: unknown;
}) => Promise<{
    removed: boolean;
}>;
//# sourceMappingURL=pushNotificationService.d.ts.map