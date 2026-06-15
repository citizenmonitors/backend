import type { AuthenticatedUser } from "../../types/authenticatedRequest.ts";
export declare const getMobileNotifications: (input: {
    user: AuthenticatedUser;
    page?: number;
    limit?: number;
}) => Promise<{
    total: number;
    page: number;
    limit: number;
    unreadCount: number;
    notifications: {
        id: string;
        type: string;
        title: string;
        message: string;
        info: string;
        articleSlug: string | null;
        articleId: string | null;
        createdAt: Date | undefined;
        isRead: boolean;
    }[];
}>;
export declare const getMobileNotificationDetail: (input: {
    user: AuthenticatedUser;
    notificationId: string;
}) => Promise<{
    id: string;
    type: string;
    title: string;
    message: string;
    info: string;
    articleSlug: string | null;
    articleId: string | null;
    createdAt: Date | undefined;
    isRead: boolean;
}>;
export declare const markMobileNotificationRead: (input: {
    user: AuthenticatedUser;
    notificationId: string;
}) => Promise<{
    message: string;
}>;
export declare const markAllMobileNotificationsRead: (input: {
    user: AuthenticatedUser;
}) => Promise<{
    message: string;
}>;
export declare const dismissMobileNotification: (input: {
    user: AuthenticatedUser;
    notificationId: string;
}) => Promise<{
    message: string;
}>;
//# sourceMappingURL=notificationService.d.ts.map