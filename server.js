import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import electionRoutes from "./routes/electionRoutes.js";

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/election", electionRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
