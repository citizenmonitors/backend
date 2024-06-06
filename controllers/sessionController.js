import { validateSession } from "../services/sessionService.js";

export const validateUserSession = async (req, res) => {
  try {
    const user = await validateSession(req.headers.authorization.split(" ")[1]);
    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
