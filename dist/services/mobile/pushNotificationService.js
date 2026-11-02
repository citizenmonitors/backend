import admin from "firebase-admin";
import "../../config/firebaseConfig.js";
import CompletedUser from "../../models/CompletedUser.js";
import { resolveNotificationDisplay } from "../../utils/notificationContent.js";
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_CHUNK_SIZE = 100;
/** Preferred Expo app slug, e.g. `@citizenmonitors/citizen-monitors`. */
const preferredExpoExperienceId = () => String(process.env.EXPO_PREFERRED_EXPERIENCE_ID ?? "").trim();
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
/**
 * Tokens from an old Expo project can't receive pushes from the current one.
 * Remember which users had them (they're on an old app build), then drop the token.
 */
const markLegacyExpoTokens = async (tokens, experienceId) => {
    const unique = Array.from(new Set(tokens.map((t) => t.trim()).filter(Boolean)));
    if (unique.length === 0)
        return;
    await CompletedUser.updateMany({ "mobileMeta.pushToken": { $in: unique } }, {
        $set: {
            "mobileMeta.legacyExpoExperienceId": experienceId,
            "mobileMeta.legacyExpoDetectedAt": new Date(),
        },
        $unset: { "mobileMeta.pushToken": "" },
    });
};
/** A push reached this user through the current project, so they've updated the app. */
const clearLegacyExpoFlag = async (userIds) => {
    if (userIds.length === 0)
        return;
    await CompletedUser.updateMany({ _id: { $in: userIds }, "mobileMeta.legacyExpoExperienceId": { $exists: true } }, {
        $unset: {
            "mobileMeta.legacyExpoExperienceId": "",
            "mobileMeta.legacyExpoDetectedAt": "",
        },
    });
};
const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";
/**
 * Expo often reports an uninstalled app (DeviceNotRegistered) only in the delivery
 * receipt, a few minutes after the send. Check receipts later and drop those tokens.
 * Best-effort and in memory: a restart skips pending checks.
 */
const scheduleExpoReceiptCheck = (receiptTokens) => {
    if (receiptTokens.size === 0)
        return;
    const delayMs = Number(process.env.EXPO_RECEIPT_CHECK_DELAY_MS) || 15 * 60 * 1000;
    const timer = setTimeout(() => {
        void checkExpoReceipts(receiptTokens).catch((error) => console.error("Expo receipt check failed:", error));
    }, delayMs);
    timer.unref?.();
};
export const checkExpoReceipts = async (receiptTokens) => {
    const ids = [...receiptTokens.keys()];
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    const expoAccessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
    if (expoAccessToken)
        headers.Authorization = `Bearer ${expoAccessToken}`;
    const dead = [];
    for (let i = 0; i < ids.length; i += 300) {
        const chunk = ids.slice(i, i + 300);
        const response = await fetch(EXPO_RECEIPTS_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({ ids: chunk }),
        });
        if (!response.ok)
            continue;
        const payload = (await response.json().catch(() => ({})));
        for (const [id, receipt] of Object.entries(payload.data ?? {})) {
            if (receipt?.status === "error" && receipt.details?.error === "DeviceNotRegistered") {
                const token = receiptTokens.get(id);
                if (token)
                    dead.push(token);
            }
        }
    }
    await clearInvalidPushTokens(dead);
    return { checked: ids.length, removed: dead.length };
};
const postExpoPushMessages = async (messages) => {
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
    const body = await response.text();
    return { ok: response.ok, status: response.status, body };
};
const applyExpoTickets = async (targets, body) => {
    let payload = {};
    try {
        payload = JSON.parse(body);
    }
    catch {
        return;
    }
    const tickets = Array.isArray(payload.data) ? payload.data : [];
    const invalidTokens = [];
    const deliveredUserIds = [];
    const receiptTokens = new Map();
    tickets.forEach((ticket, index) => {
        if (ticket.status === "ok") {
            const userId = targets[index]?.userId;
            if (userId)
                deliveredUserIds.push(userId);
            const token = targets[index]?.token;
            if (ticket.id && token)
                receiptTokens.set(ticket.id, token);
            return;
        }
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
    await clearLegacyExpoFlag(deliveredUserIds);
    scheduleExpoReceiptCheck(receiptTokens);
};
/**
 * Expo rejects a batch if tokens belong to different projects
 * (e.g. legacy `@nippysky/...` + current `@citizenmonitors/...`).
 * Retry by sending one request per experience group from the error details.
 */
const sendExpoPushChunkByExperience = async (targets, input, groups) => {
    const byToken = new Map(targets.map((t) => [t.token, t]));
    const preferred = preferredExpoExperienceId();
    const entries = Object.entries(groups);
    for (const [experienceId, tokens] of entries) {
        if (preferred && experienceId !== preferred) {
            console.warn(`Skipping Expo push tokens for non-preferred experience ${experienceId} (${tokens.length} tokens)`);
            // Stale tokens from an old Expo project: flag those users, then clear the tokens
            // so they stop poisoning batches. List them with scripts/listLegacyExpoUsers.ts.
            await markLegacyExpoTokens(tokens, experienceId);
            continue;
        }
        const groupTargets = tokens
            .map((token) => byToken.get(token))
            .filter((t) => Boolean(t));
        if (groupTargets.length === 0)
            continue;
        const messages = groupTargets.map(({ token }) => ({
            to: token,
            title: input.title.slice(0, 120),
            body: input.body.slice(0, 240),
            sound: "default",
            data: input.data,
        }));
        const result = await postExpoPushMessages(messages);
        if (!result.ok) {
            console.error(`Expo push request failed for ${experienceId}:`, result.status, result.body);
            continue;
        }
        await applyExpoTickets(groupTargets, result.body);
    }
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
    const result = await postExpoPushMessages(messages);
    if (!result.ok) {
        let parsed = null;
        try {
            parsed = JSON.parse(result.body);
        }
        catch {
            parsed = null;
        }
        const conflict = parsed?.errors?.find((err) => err.code === "PUSH_TOO_MANY_EXPERIENCE_IDS");
        if (conflict?.details && typeof conflict.details === "object") {
            console.warn("Expo push mixed experience IDs — retrying per project:", Object.keys(conflict.details).join(", "));
            await sendExpoPushChunkByExperience(targets, input, conflict.details);
            return;
        }
        console.error("Expo push request failed:", result.status, result.body);
        return;
    }
    await applyExpoTickets(targets, result.body);
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
    const { title, subtitle, link } = resolveNotificationDisplay(input.notification);
    const data = {
        notificationId: String(input.notification._id),
        type: String(input.notification.type ?? ""),
        preferenceKey: String(input.notification.preferenceKey ?? ""),
    };
    if (link?.slug)
        data.slug = link.slug;
    if (link?.articleId)
        data.articleId = link.articleId;
    await sendPushToUserIds({
        userIds: input.userIds,
        title,
        body: subtitle,
        data,
    });
};
const PUSH_PLATFORMS = ["ios", "android", "web"];
/**
 * Save the device's push token for this user (called on login / app start).
 * A token belongs to one device, so it's removed from any other account first:
 * otherwise a shared phone would keep getting the previous user's notifications.
 */
export const registerPushToken = async (userId, input) => {
    const token = String(input.token ?? "").trim();
    if (!token)
        throw new Error("token is required");
    if (!isExpoPushToken(token) && !isFcmPushToken(token)) {
        throw new Error("Invalid push token");
    }
    const platform = String(input.platform ?? "").trim().toLowerCase();
    if (platform && !PUSH_PLATFORMS.includes(platform)) {
        throw new Error("Invalid platform. Use ios, android or web");
    }
    await CompletedUser.updateMany({ _id: { $ne: userId }, "mobileMeta.pushToken": token }, { $unset: { "mobileMeta.pushToken": "" } });
    const result = await CompletedUser.updateOne({ _id: userId }, {
        $set: {
            "mobileMeta.pushToken": token,
            ...(platform ? { "mobileMeta.platform": platform } : {}),
        },
    });
    if (result.matchedCount === 0)
        throw new Error("User not found");
    return { registered: true, platform: platform || null };
};
/** Remove the token on logout. Idempotent; without a token, clears the user's token. */
export const unregisterPushToken = async (userId, input) => {
    const token = String(input.token ?? "").trim();
    const result = await CompletedUser.updateOne(token ? { _id: userId, "mobileMeta.pushToken": token } : { _id: userId }, { $unset: { "mobileMeta.pushToken": "" } });
    return { removed: result.modifiedCount > 0 };
};
//# sourceMappingURL=pushNotificationService.js.map