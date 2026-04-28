import CompletedUser from "../models/CompletedUser.ts";
import { verifyJwtEmail } from "../utils/authToken.ts";

type SessionUser = { email?: string; role?: string };

export const validateSession = async (token: string): Promise<SessionUser> => {
  const email = verifyJwtEmail(token);

  const user = (await CompletedUser.findOne({ email })) as SessionUser | null;
  if (!user) {
    throw new Error("Invalid token");
  }
  return user;
};

