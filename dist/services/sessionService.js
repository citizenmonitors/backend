import CompletedUser from "../models/CompletedUser.js";
import { verifyJwtEmail } from "../utils/authToken.js";
export const validateSession = async (token) => {
    const email = verifyJwtEmail(token);
    const user = (await CompletedUser.findOne({ email }));
    if (!user) {
        throw new Error("Invalid token");
    }
    return user;
};
//# sourceMappingURL=sessionService.js.map