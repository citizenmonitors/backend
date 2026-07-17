/**
 * Backup the MongoDB `notifications` collection and optionally clear it.
 *
 * Backup only (writes JSON under ./backups/notifications/):
 *   NODE_ENV=production tsx scripts/backupNotifications.ts
 *
 * Backup + empty live collection (requires explicit confirm flag):
 *   NODE_ENV=production tsx scripts/backupNotifications.ts --clear --confirm
 *
 * Also keep a copy inside MongoDB as `notifications_backup_YYYYMMDD`:
 *   NODE_ENV=production tsx scripts/backupNotifications.ts --archive-collection
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
dotenv.config();
const COLLECTION_NAME = "notifications";
const resolveMongoUri = () => {
    const env = process.env.NODE_ENV || "development";
    if (env === "production") {
        return process.env.MONGODB_URI_PROD || "";
    }
    if (env === "test") {
        return process.env.MONGODB_URI_TEST || "";
    }
    return process.env.MONGODB_URI_DEV || process.env.MONGODB_URI || "";
};
const timestampLabel = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}_${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
};
const run = async () => {
    const mongoUri = resolveMongoUri();
    if (!mongoUri) {
        throw new Error("MongoDB URI not set. Use MONGODB_URI_PROD (production), MONGODB_URI_DEV, or MONGODB_URI.");
    }
    const shouldClear = process.argv.includes("--clear");
    const confirmed = process.argv.includes("--confirm");
    const archiveCollection = process.argv.includes("--archive-collection");
    if (shouldClear && !confirmed) {
        throw new Error("Refusing to clear notifications without --confirm. Run with: --clear --confirm");
    }
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("Database connection is not ready.");
    }
    const collection = db.collection(COLLECTION_NAME);
    const docs = await collection.find({}).toArray();
    const count = docs.length;
    const label = timestampLabel();
    const backupDir = path.join(process.cwd(), "backups", "notifications");
    const backupFile = path.join(backupDir, `notifications_${label}.json`);
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(backupFile, JSON.stringify({
        exportedAt: new Date().toISOString(),
        collection: COLLECTION_NAME,
        count,
        documents: docs,
    }, null, 2), "utf-8");
    console.log(`Backed up ${count} notification(s) to ${backupFile}`);
    if (archiveCollection && count > 0) {
        const archiveName = `notifications_backup_${label}`;
        const archive = db.collection(archiveName);
        await archive.insertMany(docs);
        console.log(`Copied ${count} notification(s) to MongoDB collection "${archiveName}"`);
    }
    if (shouldClear) {
        const result = await collection.deleteMany({});
        console.log(`Cleared live collection "${COLLECTION_NAME}" (${result.deletedCount} deleted).`);
    }
    else if (count > 0) {
        console.log(`Live collection unchanged. To empty after backup, rerun with --clear --confirm`);
    }
    await mongoose.disconnect();
};
run().catch((error) => {
    console.error("Notification backup failed:", error);
    process.exit(1);
});
//# sourceMappingURL=backupNotifications.js.map