import jwt from "jsonwebtoken";
/** Reported to clients that store a local session timer. The JWT itself has no exp. */
const CLIENT_SESSION_SECONDS = 10 * 365 * 24 * 60 * 60;
export const accessTokenExpiresInSeconds = () => CLIENT_SESSION_SECONDS;
/**
 * Access JWT used on API requests. It does not expire.
 * Prefer `issueAuthTokens` when logging users in so a refresh token is also created.
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
    });
};
/** @deprecated Use generateAccessToken — kept as alias for call-site compatibility. */
export const generateToken = generateAccessToken;
//# sourceMappingURL=generateToken.js.map