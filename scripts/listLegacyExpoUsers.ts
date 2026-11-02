// scripts/listLegacyExpoUsers.ts
//
// Read-only. Lists users whose push token came from an old Expo project (old app build),
// plus a breakdown of app versions across all mobile users.
//
// Usage:
//   npm run legacy-expo:list                         # uses MONGODB_URI_DEV (or MONGODB_URI)
//   NODE_ENV=production npm run legacy-expo:list     # uses MONGODB_URI_PROD
//   npm run legacy-expo:list -- --csv legacy.csv     # also write the list to a CSV file
//
// Users are flagged the first time a push is sent to them after this change ships,
// so the list fills up as notifications go out.

import mongoose from "mongoose";
import dotenv from "dotenv";
import { writeFileSync } from "fs";
import CompletedUser from "../models/CompletedUser.ts";

dotenv.config();

const resolveUri = (): { uri?: string; source: string } => {
  const env = process.env.NODE_ENV || "development";
  if (env === "production") return { uri: process.env.MONGODB_URI_PROD, source: "MONGODB_URI_PROD" };
  if (env === "test") return { uri: process.env.MONGODB_URI_TEST, source: "MONGODB_URI_TEST" };
  if (process.env.MONGODB_URI_DEV) return { uri: process.env.MONGODB_URI_DEV, source: "MONGODB_URI_DEV" };
  return { uri: process.env.MONGODB_URI, source: "MONGODB_URI" };
};

const csvCell = (value: unknown): string => {
  const text = value == null ? "" : value instanceof Date ? value.toISOString() : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const main = async () => {
  const { uri, source } = resolveUri();
  if (!uri) throw new Error(`${source} is not set`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected using ${source}\n`);

  const flagged = await CompletedUser.find(
    { "mobileMeta.legacyExpoExperienceId": { $exists: true } },
    "email firstName lastName phoneNumber mobileMeta"
  )
    .sort({ "mobileMeta.legacyExpoDetectedAt": -1 })
    .lean();

  const rows = flagged.map((u) => {
    const meta = (u.mobileMeta ?? {}) as Record<string, unknown>;
    return {
      email: u.email ?? "",
      name: [u.firstName, u.lastName].filter(Boolean).join(" "),
      phone: (u as { phoneNumber?: string }).phoneNumber ?? "",
      platform: meta.platform ?? "",
      appVersion: meta.appVersion ?? "",
      lastLoginAt: meta.lastLoginAt ?? "",
      oldProject: meta.legacyExpoExperienceId ?? "",
      detectedAt: meta.legacyExpoDetectedAt ?? "",
    };
  });

  console.log(`Users on an old Expo build: ${rows.length}`);
  if (rows.length) console.table(rows);

  const versions = await CompletedUser.aggregate<{
    _id: { platform: string | null; appVersion: string | null };
    users: number;
    withPushToken: number;
    flaggedOld: number;
  }>([
    { $match: { mobileMeta: { $exists: true } } },
    {
      $group: {
        _id: { platform: "$mobileMeta.platform", appVersion: "$mobileMeta.appVersion" },
        users: { $sum: 1 },
        withPushToken: {
          $sum: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$mobileMeta.pushToken", ""] } }, 0] }, 1, 0] },
        },
        flaggedOld: {
          $sum: { $cond: [{ $ifNull: ["$mobileMeta.legacyExpoExperienceId", false] }, 1, 0] },
        },
      },
    },
    { $sort: { "_id.platform": 1, "_id.appVersion": -1 } },
  ]);

  console.log("\nApp versions across mobile users (last sign-in):");
  console.table(
    versions.map((v) => ({
      platform: v._id.platform ?? "(unknown)",
      appVersion: v._id.appVersion ?? "(not sent)",
      users: v.users,
      withPushToken: v.withPushToken,
      flaggedOld: v.flaggedOld,
    }))
  );

  const csvIndex = process.argv.indexOf("--csv");
  if (csvIndex !== -1) {
    const file = process.argv[csvIndex + 1] || "legacy-expo-users.csv";
    const header = Object.keys(rows[0] ?? { email: "" });
    const lines = [header.join(","), ...rows.map((r) => header.map((h) => csvCell((r as Record<string, unknown>)[h])).join(","))];
    writeFileSync(file, lines.join("\n") + "\n");
    console.log(`\nWrote ${rows.length} rows to ${file}`);
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
