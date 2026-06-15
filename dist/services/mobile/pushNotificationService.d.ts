import "../../config/firebaseConfig.ts";
export declare const isMobilePushEnabled: () => boolean;
export declare const isExpoPushToken: (token: string) => boolean;
/** Native FCM/APNs device tokens (not Expo's wrapper format). */
export declare const isFcmPushToken: (token: string) => boolean;
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
//# sourceMappingURL=pushNotificationService.d.ts.map