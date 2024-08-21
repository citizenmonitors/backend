import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import electionRoutes from "./routes/Election/electionRoutes.js";
import locations from "./routes/locations.js";
import locationRoutes from "./routes/Location/locationRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import userRoutes from "./routes/userDashboard/userRoutes.js";
import adminRoutes from "./routes/adminRoutes/adminElectionRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api", locations);
app.use("/api/locations", locationRoutes);
app.use("/api", bankRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);

app.use("/governmentid", express.static(path.join(__dirname, "governmentId")));
app.use("/profileimage", express.static(path.join(__dirname, "profileImage")));

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

