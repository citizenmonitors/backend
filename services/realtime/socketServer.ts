import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import CompletedUser from "../../models/CompletedUser.ts";
import { extractBearerToken, verifyJwtEmail } from "../../utils/authToken.ts";

export const userRoomName = (userId: string): string => `user:${userId}`;

const resolveTokenFromHandshake = (socket: {
  handshake: {
    auth?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    query?: Record<string, unknown>;
  };
}): string | undefined => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }

  const authHeader = socket.handshake.headers?.authorization;
  if (typeof authHeader === "string") {
    const bearer = extractBearerToken(authHeader);
    if (bearer) return bearer;
  }

  const queryToken = socket.handshake.query?.token;
  if (typeof queryToken === "string" && queryToken.trim()) {
    return queryToken.trim();
  }

  return undefined;
};

export const initSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
        : true,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = resolveTokenFromHandshake(socket);
      if (!token) {
        return next(new Error("Authentication token is missing"));
      }

      const email = verifyJwtEmail(token);
      const user = await CompletedUser.findOne({ email }, "_id isActive").lean();
      if (!user || user.isActive === false) {
        return next(new Error("Invalid or inactive user"));
      }

      const userId = String(user._id);
      socket.data.userId = userId;
      socket.join(userRoomName(userId));
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.emit("realtime:connected", {
      userId: String(socket.data.userId ?? ""),
      connectedAt: new Date().toISOString(),
    });
  });

  return io;
};

