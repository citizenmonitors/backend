import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import File from "../models/file.js";
import IncidentReport from "../models/Election/IncidentReport.js";
import CompletedUser from "../models/CompletedUser.js";
import { uploadFileToFirebase } from "../config/firebaseUploader.js";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to database\n");
} catch (error) {
  console.error("❌ Failed to connect to database:", error.message);
  process.exit(1);
}

const getFirebaseFolder = (file) => {
  if (!file.location) throw new Error(`Invalid file location: ${file.location}`);
  if (file.location.includes("/profileImage/")) return "profile_images";
  if (file.location.includes("/observerid/")) return "observer_ids";
  if (file.location.includes("/incidentreport/")) {
    if (file.type?.startsWith("video")) return "incident_videos";
    if (file.type?.startsWith("image")) return "incident_pictures";
  }
  if (file.location.includes("/resultpicture/")) return "result_pictures";
  if (file.location.includes("/resultvideo/")) return "result_videos";
  return "migrated_files";
};

const migrateFilesCollection = async () => {
  const files = await File.find({ url: { $regex: "navalny.onrender.com" } });
  if (!files.length) {
    console.log("No File documents found for migration.");
    return;
  }
  console.log(`🔄 Migrating ${files.length} File documents...\n`);

  let uploads = 0;

  await Promise.all(files.map(async (file) => {
    if (!fs.existsSync(file.location)) {
      console.warn(`❌ File not found: ${file.location}`);
      file.url = null;
      file.location = null;
      await file.save();
      return;
    }

    try {
      const folder = getFirebaseFolder(file);
      console.log(`📤 Uploading: ${file.name}`);
      const { publicUrl, filePath, token } = await uploadFileToFirebase(
        {
          buffer: fs.readFileSync(file.location),
          originalname: file.name,
          mimetype: file.type,
        },
        folder
      );
      file.location = filePath;
      file.url = publicUrl;
      file.token = token;
      await file.save();
      uploads++;
      console.log(`✅ Migrated: ${file.name} → ${publicUrl}`);
    } catch (error) {
      console.error(`❌ Failed to migrate file: ${file.name}`, error.message);
    }
  }));

  console.log(`✅ Migrated ${uploads} files in File collection.\n`);
};

const migrateIncidentReports = async () => {
  const reports = await IncidentReport.find({
    $or: [
      { "incidentPictures.url": { $regex: "navalny.onrender.com" } },
      { "incidentVideos.url": { $regex: "navalny.onrender.com" } },
    ],
  });
  if (!reports.length) {
    console.log("No incident reports found for migration.");
    return;
  }
  console.log(`🔄 Migrating ${reports.length} incident reports...\n`);

  await Promise.all(reports.map(async (report) => {
    try {
      let uploads = 0;

      await Promise.all(report.incidentPictures.map(async (file) => {
        if (!fs.existsSync(file.location)) {
          console.warn(`❌ Picture not found: ${file.location}`);
          return;
        }
        console.log(`📤 Uploading incident picture: ${file.name}`);
        const { publicUrl, filePath } = await uploadFileToFirebase(
          {
            buffer: fs.readFileSync(file.location),
            originalname: file.name,
            mimetype: file.type,
          },
          "incident_pictures"
        );
        file.location = filePath;
        file.url = publicUrl;
        uploads++;
      }));

      await Promise.all(report.incidentVideos.map(async (file) => {
        if (!fs.existsSync(file.location)) {
          console.warn(`❌ Video not found: ${file.location}`);
          return;
        }
        console.log(`📤 Uploading incident video: ${file.name}`);
        const { publicUrl, filePath } = await uploadFileToFirebase(
          {
            buffer: fs.readFileSync(file.location),
            originalname: file.name,
            mimetype: file.type,
          },
          "incident_videos"
        );
        file.location = filePath;
        file.url = publicUrl;
        uploads++;
      }));

      if (uploads) {
        report.markModified("incidentPictures");
        report.markModified("incidentVideos");
        await report.save();
        console.log(`✅ Migrated ${uploads} files in incident report: ${report._id}`);
      } else {
        console.warn(`⚠️ No files found for incident report: ${report._id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate incident report: ${report._id}`, error.message);
    }
  }));

  console.log(`✅ Completed incident reports migration.\n`);
};

const migrateCompletedUsers = async () => {
  const users = await CompletedUser.find({
    $or: [
      { "observerId.url": { $regex: "navalny.onrender.com" } },
      { "profileImage.url": { $regex: "navalny.onrender.com" } },
    ],
  });
  if (!users.length) {
    console.log("No CompletedUser documents with observer IDs or profile images found.");
    return;
  }
  console.log(`🔄 Migrating ${users.length} CompletedUser documents...\n`);

  await Promise.all(users.map(async (user) => {
    try {
      let uploads = 0;

      await Promise.all(user.observerId.map(async (file) => {
        if (!fs.existsSync(file.location)) {
          console.warn(`❌ Observer ID not found: ${file.location}`);
          return;
        }
        console.log(`📤 Uploading observer ID: ${file.name}`);
        const { publicUrl, filePath } = await uploadFileToFirebase(
          {
            buffer: fs.readFileSync(file.location),
            originalname: file.name,
            mimetype: file.type,
          },
          "observer_ids"
        );
        file.location = filePath;
        file.url = publicUrl;
        uploads++;
      }));

      if (user.profileImage?.location && fs.existsSync(user.profileImage.location)) {
        console.log(`📤 Uploading profile image: ${user.profileImage.name}`);
        const { publicUrl, filePath } = await uploadFileToFirebase(
          {
            buffer: fs.readFileSync(user.profileImage.location),
            originalname: user.profileImage.name,
            mimetype: user.profileImage.type,
          },
          "profile_images"
        );
        user.profileImage.location = filePath;
        user.profileImage.url = publicUrl;
        uploads++;
      }

      if (uploads) {
        user.markModified("observerId");
        user.markModified("profileImage");
        await user.save();
        console.log(`✅ Migrated ${uploads} files for user: ${user.email}`);
      } else {
        console.warn(`⚠️ No files found for user: ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate user: ${user.email}`, error.message);
    }
  }));

  console.log(`✅ Completed CompletedUser migration.\n`);
};

const runFullMigration = async () => {
  await migrateFilesCollection();
  await migrateIncidentReports();
  await migrateCompletedUsers();

  console.log("\n✅✅✅ Full migration completed.\n");
  await mongoose.disconnect();
};

runFullMigration();
