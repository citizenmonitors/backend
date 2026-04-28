// scripts/backfillInboxFields.ts

import mongoose from "mongoose";
import CompletedUser from "../models/CompletedUser.ts";
import dotenv from "dotenv";
dotenv.config();
const MONGODBURI = process.env.MONGODB_URI;

const runBackfill = async () => {
  try {
    if (!MONGODBURI) throw new Error("MONGODB_URI environment variable is not set");
    await mongoose.connect(MONGODBURI);

    const result = await CompletedUser.updateMany(
      {},
      {
        $set: {
          "notifications.email.inbox": true,
          "notifications.email.elections": true,
          "notifications.email.newsletter": true,
        },
      }
    );

    console.log(`✅ Backfill complete: ${result.modifiedCount} users updated.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error running backfill:", error);
    process.exit(1);
  }
};

runBackfill();
