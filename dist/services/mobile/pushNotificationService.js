import admin from "firebase-admin";
import "../../config/firebaseConfig.js";
import CompletedUser from "../../models/CompletedUser.js";
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_CHUNK_SIZE = 100;
const isTruthyEnv = (value) => value === "1" || value === "true" || value === "yes";
export const isMobilePushEnabled = () => {
    if (isTruthyEnv(process.env.PUSH_NOTIFICATIONS_ENABLED))
        return true;
    if (isTruthyEnv(process.env.PUSH_NOTIFICATIONS_DISABLED))
        return false;
    return process.env.NODE_ENV === "production";
};
export const isExpoPushToken = (token) => token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken[");
/** Native FCM/APNs device tokens (not Expo's wrapper format). */
export const isFcmPushToken = (token) => {
    if (!token || isExpoPushToken(token))
        return false;
    if (token.length < 32 || token.length > 4096)
        return false;
    return /^[a-zA-Z0-9_:/-]+$/.test(token);
};
const isFirebaseMessagingReady = () => {
    try {
        return admin.apps.length > 0;
    }
    catch {
        return false;
    }
};
const clearInvalidPushTokens = async (tokens) => {
    const unique = Array.from(new Set(tokens.map((t) => t.trim()).filter(Boolean)));
    if (unique.length === 0)
        return;
    await CompletedUser.updateMany({ "mobileMeta.pushToken": { $in: unique } }, { $unset: { "mobileMeta.pushToken": "" } });
};
const sendExpoPushChunk = async (targets, input) => {
    if (targets.length === 0)
        return;
    const messages = targets.map(({ token }) => ({
        to: token,
        title: input.title.slice(0, 120),
        body: input.body.slice(0, 240),
        sound: "default",
        data: input.data,
    }));
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    const expoAccessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
    if (expoAccessToken) {
        headers.Authorization = `Bearer ${expoAccessToken}`;
    }
    const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(messages),
    });
    if (!response.ok) {
        const text = await response.text();
        console.error("Expo push request failed:", response.status, text);
        return;
    }
    const payload = (await response.json());
    const tickets = Array.isArray(payload.data) ? payload.data : [];
    const invalidTokens = [];
    tickets.forEach((ticket, index) => {
        if (ticket.status !== "error")
            return;
        const errorCode = ticket.details?.error ?? "";
        if (errorCode === "DeviceNotRegistered" || errorCode === "InvalidCredentials") {
            const token = targets[index]?.token;
            if (token)
                invalidTokens.push(token);
        }
    });
    if (invalidTokens.length > 0) {
        await clearInvalidPushTokens(invalidTokens);
    }
};
const sendFcmPush = async (targets, input) => {
    if (targets.length === 0 || !isFirebaseMessagingReady())
        return;
    const tokens = targets.map((t) => t.token);
    try {
        const response = await admin.messaging().sendEachForMulticast({
            tokens,
            notification: {
                title: input.title.slice(0, 120),
                body: input.body.slice(0, 240),
            },
            data: input.data
                ? Object.fromEntries(Object.entries(input.data).map(([key, value]) => [key, String(value)]))
                : undefined,
        });
        const invalidTokens = [];
        response.responses.forEach((result, index) => {
            if (result.success)
                return;
            const code = result.error?.code ?? "";
            if (code === "messaging/registration-token-not-registered" ||
                code === "messaging/invalid-registration-token") {
                invalidTokens.push(tokens[index]);
            }
        });
        if (invalidTokens.length > 0) {
            await clearInvalidPushTokens(invalidTokens);
        }
    }
    catch (error) {
        console.error("FCM push request error:", error);
    }
};
export const sendPushToUserIds = async (input) => {
    if (!isMobilePushEnabled())
        return;
    const uniqueIds = Array.from(new Set(input.userIds.map(String).filter(Boolean)));
    if (uniqueIds.length === 0)
        return;
    const users = await CompletedUser.find({ _id: { $in: uniqueIds } }, "_id mobileMeta.pushToken").lean();
    const expoTargets = [];
    const fcmTargets = [];
    for (const user of users) {
        const token = String(user.mobileMeta?.pushToken ?? "").trim();
        const userId = String(user._id);
        if (!token)
            continue;
        if (isExpoPushToken(token)) {
            expoTargets.push({ token, userId });
        }
        else if (isFcmPushToken(token)) {
            fcmTargets.push({ token, userId });
        }
    }
    for (let i = 0; i < expoTargets.length; i += EXPO_CHUNK_SIZE) {
        const chunk = expoTargets.slice(i, i + EXPO_CHUNK_SIZE);
        try {
            await sendExpoPushChunk(chunk, input);
        }
        catch (error) {
            console.error("Expo push chunk error:", error);
        }
    }
    for (let i = 0; i < fcmTargets.length; i += EXPO_CHUNK_SIZE) {
        const chunk = fcmTargets.slice(i, i + EXPO_CHUNK_SIZE);
        try {
            await sendFcmPush(chunk, input);
        }
        catch (error) {
            console.error("FCM push chunk error:", error);
        }
    }
};
export const sendPushForMobileNotification = async (input) => {
    const title = String(input.notification.body ?? "Citizen Monitors").trim() || "Citizen Monitors";
    const body = String(input.notification.info ?? input.notification.body ?? "").trim() || title;
    await sendPushToUserIds({
        userIds: input.userIds,
        title,
        body,
        data: {
            notificationId: String(input.notification._id),
            type: String(input.notification.type ?? ""),
            preferenceKey: String(input.notification.preferenceKey ?? ""),
            info: String(input.notification.info ?? ""),
        },
    });
};
//# sourceMappingURL=pushNotificationService.js.map