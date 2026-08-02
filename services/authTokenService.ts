import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.ts";
import {
  accessTokenExpiresInSeconds,
  generateAccessToken,
} from "../utils/generateToken.ts";

const REFRESH_TOKEN_EXPIRES_DAYS = Math.max(
  1,
  Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30
);

export type IssuedAuthTokens = {
  token: string;
  refreshToken: string;
  expiresIn: number;
};

const hashToken = (raw: string): string =>
  crypto.createHash("sha256").update(raw).digest("hex");

const newOpaqueToken = (): string => crypto.randomBytes(48).toString("hex");

export type IssueAuthTokensMeta = {
  userAgent?: string | null;
  deviceId?: string | null;
};

export const issueAuthTokens = async (
  email: string,
  meta?: IssueAuthTokensMeta
): Promise<IssuedAuthTokens> => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const token = generateAccessToken({ email: normalizedEmail });
  const refreshToken = newOpaqueToken();
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

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

export const refreshAuthTokens = async (
  rawRefreshToken: string,
  meta?: IssueAuthTokensMeta
): Promise<IssuedAuthTokens> => {
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
    await RefreshToken.updateMany(
      { email: existing.email, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
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

export const revokeRefreshToken = async (
  rawRefreshToken: string
): Promise<void> => {
  const raw = String(rawRefreshToken ?? "").trim();
  if (!raw) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(raw), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

export const revokeAllRefreshTokensForEmail = async (
  email: string
): Promise<void> => {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail) return;
  await RefreshToken.updateMany(
    { email: normalizedEmail, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};
