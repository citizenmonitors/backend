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
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { ensureDefaultSpeakerEvent } from "./services/speakerSlots/seedSpeakerEvent.js";
import redisClient from "./utils/notification/redisClient.js";
import { NEWSLETTER_COVER_DIR } from "./utils/newsletterCover.js";
import authRoutes from "./routes/auth.js";
import electionRoutes from "./routes/Election/electionRoutes.js";
import locations from "./routes/locations.js";
import locationRoutes from "./routes/Location/locationRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import userRoutes from "./routes/userDashboard/userRoutes.js";
import adminRoutes from "./routes/adminRoutes/adminElectionRoutes.js";
import resourcesRoutes from "./routes/Resources/supportRoute.js";
import speakerSlotsRoutes from "./routes/speakerSlots.js";
import pvcIssuesRoutes from "./routes/pvcIssuesRoutes.js";
import mobileAuthRoutes from "./routes/mobile/authRoutes.js";
import mobileLocationRoutes from "./routes/mobile/locationRoutes.js";
import mobileBankRoutes from "./routes/mobile/bankRoutes.js";
import mobileProfileRoutes from "./routes/mobile/profileRoutes.js";
import mobileElectionRoutes from "./routes/mobile/electionRoutes.js";
import mobileNotificationRoutes from "./routes/mobile/notificationRoutes.js";
import mobileDashboardRoutes from "./routes/mobile/dashboardRoutes.js";
import mobilePulseRoutes from "./routes/mobile/pulseRoutes.js";
import webPulseRoutes from "./routes/web/pulseRoutes.js";
import mobileAcademyRoutes from "./routes/mobile/academyRoutes.js";
import mobileFaqRoutes from "./routes/mobile/faqRoutes.js";
import mobileNewsInsightRoutes from "./routes/mobile/newsInsightRoutes.js";
import mobilePressCoverageRoutes from "./routes/mobile/pressCoverageRoutes.js";
import anonymousRoutes from "./routes/anonymousRoutes.js";
import collationDiscussionRoutes from "./routes/collationDiscussionRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import mobileDonationRoutes from "./routes/mobile/donationRoutes.js";
import { assertInhouseApiAccessConfigured, inhouseApiAccessMiddleware, } from "./middleware/inhouseApiAccessMiddleware.js";
import { initSocketServer } from "./services/realtime/socketServer.js";
import { setSocketServer } from "./services/realtime/socketBus.js";
assertInhouseApiAccessConfigured();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : [];
app.use(cors({
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        if (isDev && allowedOrigins.length === 0)
            return cb(null, true);
        if (/^https?:\/\/localhost(:\d+)?$/i.test(origin))
            return cb(null, true);
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        cb(null, false);
    },
    credentials: true,
}));
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
app.use((req, res, next) => {
    const path = req.path ?? "";
    if (!path.startsWith("/api")) {
        return next();
    }
    return inhouseApiAccessMiddleware(req, res, next);
});
app.get("/health/live", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.get("/health/ready", async (_req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    const redisRequired = Boolean(process.env.REDIS_URL);
    let redisReady = true;
    if (redisRequired) {
        redisReady = redisClient.isOpen;
        if (redisReady) {
            try {
                const pong = await redisClient.ping();
                redisReady = pong === "PONG";
            }
            catch {
                redisReady = false;
            }
        }
    }
    const ready = mongoReady && redisReady;
    res.status(ready ? 200 : 503).json({
        status: ready ? "ready" : "not_ready",
        checks: {
            mongo: mongoReady ? "up" : "down",
            redis: redisRequired ? (redisReady ? "up" : "down") : "not_configured",
        },
    });
});
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
app.use("/api/profile", mobileProfileRoutes);
app.use("/api/dashboard", mobileDashboardRoutes);
app.use("/api/academy", mobileAcademyRoutes);
app.use("/api/pulse", webPulseRoutes);
app.use("/api/anonymous", anonymousRoutes);
app.use("/api/collation", collationDiscussionRoutes);
app.use("/api", adminRoutes);
app.use("/api", resourcesRoutes);
app.use("/api/speaker-slots", speakerSlotsRoutes);
app.use("/api/pvc-issues", pvcIssuesRoutes);
app.use("/api/donations", donationRoutes);
// Versioned API aliases for safer incremental evolution (mobile/web clients)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/elections", electionRoutes);
app.use("/api/v1", locations);
app.use("/api/v1/locations", locationRoutes);
app.use("/api/v1", bankRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1/profile", mobileProfileRoutes);
app.use("/api/v1/dashboard", mobileDashboardRoutes);
app.use("/api/v1/academy", mobileAcademyRoutes);
app.use("/api/v1/pulse", webPulseRoutes);
app.use("/api/v1/anonymous", anonymousRoutes);
app.use("/api/v1/collation", collationDiscussionRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", resourcesRoutes);
app.use("/api/v1/speaker-slots", speakerSlotsRoutes);
app.use("/api/v1/pvc-issues", pvcIssuesRoutes);
app.use("/api/v1/donations", donationRoutes);
app.use("/api/v1/mobile/auth", mobileAuthRoutes);
app.use("/api/v1/mobile/locations", mobileLocationRoutes);
app.use("/api/v1/mobile/banks", mobileBankRoutes);
app.use("/api/v1/mobile/profile", mobileProfileRoutes);
app.use("/api/v1/mobile/elections", mobileElectionRoutes);
app.use("/api/v1/mobile/notifications", mobileNotificationRoutes);
app.use("/api/v1/mobile/dashboard", mobileDashboardRoutes);
app.use("/api/v1/mobile/pulse", mobilePulseRoutes);
app.use("/api/v1/mobile/academy", mobileAcademyRoutes);
app.use("/api/v1/mobile/faq", mobileFaqRoutes);
app.use("/api/v1/mobile/news-insights", mobileNewsInsightRoutes);
app.use("/api/v1/mobile/press-coverage", mobilePressCoverageRoutes);
app.use("/api/v1/mobile/donations", mobileDonationRoutes);
app.use("/observerid", express.static(path.join(__dirname, "observerId")));
app.use("/profileimage", express.static(path.join(__dirname, "profileImage")));
app.use("/resultpicture", express.static(path.join(__dirname, "electionsData")));
app.use("/incidentreport", express.static(path.join(__dirname, "electionsData")));
app.use("/newsletter-covers", express.static(NEWSLETTER_COVER_DIR));
app.use((err, _req, res, _next) => {
    const isProd = process.env.NODE_ENV === "production";
    const e = err;
    console.error(err);
    res.status(e.status || 500).json({
        message: isProd ? "An error occurred" : e.message,
    });
});
const PORT = process.env.PORT || 4000;
const httpServer = http.createServer(app);
const io = initSocketServer(httpServer);
setSocketServer(io);
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=server.js.map