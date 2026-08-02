import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";
import { accessTokenExpiresInSeconds, generateAccessToken, } from "../utils/generateToken.js";
const REFRESH_TOKEN_EXPIRES_DAYS = Math.max(1, Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30);
const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");
const newOpaqueToken = () => crypto.randomBytes(48).toString("hex");
export const issueAuthTokens = async (email, meta) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const token = generateAccessToken({ email: normalizedEmail });
    const refreshToken = newOpaqueToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
        email: normalizedEmail,
        tokenHash: hashToken(refreshToken),
        expiresAt,
        userAgent: meta?.userAgent ?? null,
        deviceId: meta?.deviceId ?? null,
    });
    return {
        token,
        refreshToken,
        expiresIn: accessTokenExpiresInSeconds(),
    };
};
export const refreshAuthTokens = async (rawRefreshToken, meta) => {
    const raw = String(rawRefreshToken ?? "").trim();
    if (!raw) {
        throw new Error("Refresh token is required");
    }
    const tokenHash = hashToken(raw);
    const existing = await RefreshToken.findOne({ tokenHash });
    if (!existing) {
        throw new Error("Invalid refresh token");
    }
    if (existing.revokedAt) {
        // Reuse of a revoked token → revoke all sessions for this email (theft detection).
        await RefreshToken.updateMany({ email: existing.email, revokedAt: null }, { $set: { revokedAt: new Date() } });
        throw new Error("Refresh token has been revoked. Please sign in again.");
    }
    if (existing.expiresAt.getTime() <= Date.now()) {
        existing.revokedAt = new Date();
        await existing.save();
        throw new Error("Refresh token expired. Please sign in again.");
    }
    const issued = await issueAuthTokens(existing.email, meta);
    existing.revokedAt = new Date();
    existing.replacedByHash = hashToken(issued.refreshToken);
    await existing.save();
    return issued;
};
export const revokeRefreshToken = async (rawRefreshToken) => {
    const raw = String(rawRefreshToken ?? "").trim();
    if (!raw)
        return;
    await RefreshToken.updateOne({ tokenHash: hashToken(raw), revokedAt: null }, { $set: { revokedAt: new Date() } });
};
export const revokeAllRefreshTokensForEmail = async (email) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail)
        return;
    await RefreshToken.updateMany({ email: normalizedEmail, revokedAt: null }, { $set: { revokedAt: new Date() } });
};
//# sourceMappingURL=authTokenService.js.map