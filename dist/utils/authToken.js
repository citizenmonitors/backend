import jwt from "jsonwebtoken";
export const extractBearerToken = (authorizationHeader) => {
    if (!authorizationHeader)
        return undefined;
    const [scheme, token] = authorizationHeader.split(" ");
    if (!scheme || !token)
        return undefined;
    if (scheme.toLowerCase() !== "bearer")
        return undefined;
    return token;
};
export const verifyJwtEmail = (token) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not set");
    }
    const verified = jwt.verify(token, jwtSecret, {
        algorithms: ["HS256"],
    });
    const email = typeof verified === "string" ? undefined : verified.email;
    if (!email) {
        throw new Error("Invalid token");
    }
    return email;
};
//# sourceMappingURL=authToken.js.map