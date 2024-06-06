import jwt from "jsonwebtoken";
import CompletedUser from "../models/CompletedUser.js";

export const validateSession = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await CompletedUser.findOne({ email: decoded.email });
  if (!user) {
    throw new Error("Invalid token");
  }
  return user;
};
