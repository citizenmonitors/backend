import crypto from "crypto";
const HEADER_NAME = "x-inhouse-access-token";
const parseAllowedTokens = () => {
    const raw = process.env.INHOUSE_API_ACCESS_TOKEN?.trim();
    if (!raw)
        return [];
    return raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
};
/** Call at process startup. Production must have at least one token configured. */
export const assertInhouseApiAccessConfigured = () => {
    if (process.env.NODE_ENV !== "production")
        return;
    if (parseAllowedTokens().length === 0) {
        console.error("FATAL: INHOUSE_API_ACCESS_TOKEN must be set in production (comma-separated values allowed)");
        process.exit(1);
    }
};
const timingSafeMatch = (provided, expected) => {
    const a = Buffer.from(provided, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length)
        return false;
    return crypto.timingSafeEqual(a, b);
};
export const inhouseApiAccessMiddleware = (req, res, next) => {
    const allowed = parseAllowedTokens();
    // Fail closed: never skip the gate when the env var is missing.
    if (allowed.length === 0) {
        res.status(503).json({
            message: "API access gate is not configured",
            hint: "Set INHOUSE_API_ACCESS_TOKEN on the server",
        });
        return;
    }
    const provided = String(req.get(HEADER_NAME) ?? "").trim();
    if (!provided) {
        res.status(401).json({
            message: "API access token is required",
            hint: "Send header X-Inhouse-Access-Token with the value of INHOUSE_API_ACCESS_TOKEN",
        });
        return;
    }
    const ok = allowed.some((token) => timingSafeMatch(provided, token));
    if (!ok) {
        res.status(403).json({ message: "Invalid API access token" });
        return;
    }
    next();
};
//# sourceMappingURL=inhouseApiAccessMiddleware.js.map