import jwt from "jsonwebtoken";
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN?.trim() || "1h";
/** Parse values like `15m`, `1h`, `7d` into seconds for clients. */
export const accessTokenExpiresInSeconds = () => {
    const raw = ACCESS_TOKEN_EXPIRES_IN;
    const match = /^(\d+)([smhd])$/i.exec(raw);
    if (!match)
        return 60 * 60;
    const n = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === "s")
        return n;
    if (unit === "m")
        return n * 60;
    if (unit === "h")
        return n * 60 * 60;
    return n * 60 * 60 * 24;
};
/**
 * Short-lived access JWT used on API requests.
 * Prefer `issueAuthTokens` when logging users in so a refresh token is also created.
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
};
/** @deprecated Use generateAccessToken — kept as alias for call-site compatibility. */
export const generateToken = generateAccessToken;
//# sourceMappingURL=generateToken.js.map