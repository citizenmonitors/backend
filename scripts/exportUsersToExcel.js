// scripts/exportUsersToExcel.js

import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportUsersToExcel = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Fetch all users from the database
    console.log("📊 Fetching users from database...");
    const users = await User.find({}).select("email verificationCode firstName lastName profileImage");

    console.log(`✅ Found ${users.length} users\n`);

    // Transform data for Excel export
    const excelData = users.map((user) => ({
      email: user.email || "",
      verificationCode: user.verificationCode || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      profileImage: user.profileImage?.url || "",
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const filename = `users_export_${timestamp}.xlsx`;
    const filepath = path.join(__dirname, "..", filename);

    // Write the file
    XLSX.writeFile(workbook, filepath);
    console.log(`✅ Excel file created successfully: ${filename}`);
    console.log(`📁 File location: ${filepath}\n`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error exporting users to Excel:", error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

exportUsersToExcel();

