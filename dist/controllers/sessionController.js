import { validateSession } from "../services/sessionService.js";
import { extractBearerToken } from "../utils/authToken.js";
export const validateUserSession = async (req, res) => {
    try {
        const token = extractBearerToken(req.headers.authorization);
        if (!token)
            return res.status(401).json({ message: "Invalid token" });
        const user = await validateSession(token);
        return res.status(200).json(user);
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
//# sourceMappingURL=sessionController.js.map