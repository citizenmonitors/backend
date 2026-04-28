import jwt from "jsonwebtoken";

export const generateToken = (payload: Record<string, unknown>): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
    algorithm: "HS256",
  });
};

