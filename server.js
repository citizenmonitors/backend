import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET must be set and at least 32 characters");
  process.exit(1);
}

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { ensureDefaultSpeakerEvent } from "./services/speakerSlots/seedSpeakerEvent.js";
import authRoutes from "./routes/auth.js";
import electionRoutes from "./routes/Election/electionRoutes.js";
import locations from "./routes/locations.js";
import locationRoutes from "./routes/Location/locationRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import userRoutes from "./routes/userDashboard/userRoutes.js";
import adminRoutes from "./routes/adminRoutes/adminElectionRoutes.js";
import resourcesRoutes from "./routes/Resources/supportRoute.js";
import speakerSlotsRoutes from "./routes/speakerSlots.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (isDev && allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);
app.use(helmet({ contentSecurityPolicy: false }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests" },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts" },
});
app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
mongoose.connection.once("connected", () => {
  ensureDefaultSpeakerEvent();
});

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api", locations);
app.use("/api/locations", locationRoutes);
app.use("/api", bankRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api", resourcesRoutes);
app.use("/api/speaker-slots", speakerSlotsRoutes);

app.use("/observerid", express.static(path.join(__dirname, "observerId")));
app.use("/profileimage", express.static(path.join(__dirname, "profileImage")));
app.use("/resultpicture", express.static(path.join(__dirname, "electionsData")));
app.use("/incidentreport", express.static(path.join(__dirname, "electionsData")));

app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  console.error(err);
  res.status(err.status || 500).json({
    message: isProd ? "An error occurred" : err.message,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

