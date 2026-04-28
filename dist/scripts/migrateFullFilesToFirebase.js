import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import File from "../models/file.js";
import IncidentReport from "../models/Election/IncidentReport.js";
import CompletedUser from "../models/CompletedUser.js";
import { uploadFileToFirebase } from "../config/firebaseUploader.js";
dotenv.config();
try {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is not set");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database\n");
}
catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to connect to database:", message);
    process.exit(1);
}
const getFirebaseFolder = (file) => {
    if (!file.location)
        throw new Error(`Invalid file location: ${file.location}`);
    if (file.location.includes("/profileImage/"))
        return "profile_images";
    if (file.location.includes("/observerid/"))
        return "observer_ids";
    if (file.location.includes("/incidentreport/")) {
        if (file.type?.startsWith("video"))
            return "incident_videos";
        if (file.type?.startsWith("image"))
            return "incident_pictures";
    }
    if (file.location.includes("/resultpicture/"))
        return "result_pictures";
    if (file.location.includes("/resultvideo/"))
        return "result_videos";
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
        const fileDoc = file;
        const location = file.location;
        if (!location || typeof location !== "string") {
            console.warn(`❌ File not found: ${String(location)}`);
            fileDoc.url = null;
            fileDoc.location = null;
            await fileDoc.save();
            return;
        }
        if (!fs.existsSync(location)) {
            console.warn(`❌ File not found: ${location}`);
            fileDoc.url = null;
            fileDoc.location = null;
            await fileDoc.save();
            return;
        }
        try {
            const folder = getFirebaseFolder(file);
            const originalname = file.name ?? "unknown";
            const mimetype = file.type ?? "application/octet-stream";
            console.log(`📤 Uploading: ${originalname}`);
            const { publicUrl, filePath, token } = await uploadFileToFirebase({
                buffer: fs.readFileSync(location),
                originalname,
                mimetype,
            }, folder);
            fileDoc.location = filePath;
            fileDoc.url = publicUrl;
            fileDoc.token = token;
            await fileDoc.save();
            uploads++;
            console.log(`✅ Migrated: ${originalname} → ${publicUrl}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed to migrate file: ${file.name}`, message);
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
                const location = file.location;
                if (!location || typeof location !== "string") {
                    console.warn(`❌ Picture not found: ${String(location)}`);
                    return;
                }
                if (!fs.existsSync(location)) {
                    console.warn(`❌ Picture not found: ${location}`);
                    return;
                }
                const originalname = file.name ?? "unknown";
                const mimetype = file.type ?? "application/octet-stream";
                console.log(`📤 Uploading incident picture: ${originalname}`);
                const { publicUrl, filePath } = await uploadFileToFirebase({
                    buffer: fs.readFileSync(location),
                    originalname,
                    mimetype,
                }, "incident_pictures");
                file.location = filePath;
                file.url = publicUrl;
                uploads++;
            }));
            await Promise.all(report.incidentVideos.map(async (file) => {
                const location = file.location;
                if (!location || typeof location !== "string") {
                    console.warn(`❌ Video not found: ${String(location)}`);
                    return;
                }
                if (!fs.existsSync(location)) {
                    console.warn(`❌ Video not found: ${location}`);
                    return;
                }
                const originalname = file.name ?? "unknown";
                const mimetype = file.type ?? "application/octet-stream";
                console.log(`📤 Uploading incident video: ${originalname}`);
                const { publicUrl, filePath } = await uploadFileToFirebase({
                    buffer: fs.readFileSync(location),
                    originalname,
                    mimetype,
                }, "incident_videos");
                file.location = filePath;
                file.url = publicUrl;
                uploads++;
            }));
            if (uploads) {
                report.markModified("incidentPictures");
                report.markModified("incidentVideos");
                await report.save();
                console.log(`✅ Migrated ${uploads} files in incident report: ${report._id}`);
            }
            else {
                console.warn(`⚠️ No files found for incident report: ${report._id}`);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed to migrate incident report: ${report._id}`, message);
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
                const location = file.location;
                if (!location || typeof location !== "string") {
                    console.warn(`❌ Observer ID not found: ${String(location)}`);
                    return;
                }
                if (!fs.existsSync(location)) {
                    console.warn(`❌ Observer ID not found: ${location}`);
                    return;
                }
                const originalname = file.name ?? "unknown";
                const mimetype = file.type ?? "application/octet-stream";
                console.log(`📤 Uploading observer ID: ${originalname}`);
                const { publicUrl, filePath } = await uploadFileToFirebase({
                    buffer: fs.readFileSync(location),
                    originalname,
                    mimetype,
                }, "observer_ids");
                file.location = filePath;
                file.url = publicUrl;
                uploads++;
            }));
            const profileLocation = user.profileImage?.location;
            if (typeof profileLocation === "string" && fs.existsSync(profileLocation)) {
                const profileImage = user.profileImage;
                if (!profileImage)
                    return;
                const originalname = user.profileImage?.name ?? "profile_image";
                const mimetype = user.profileImage?.type ?? "application/octet-stream";
                console.log(`📤 Uploading profile image: ${originalname}`);
                const { publicUrl, filePath } = await uploadFileToFirebase({
                    buffer: fs.readFileSync(profileLocation),
                    originalname,
                    mimetype,
                }, "profile_images");
                profileImage.location = filePath;
                profileImage.url = publicUrl;
                uploads++;
            }
            if (uploads) {
                user.markModified("observerId");
                user.markModified("profileImage");
                await user.save();
                console.log(`✅ Migrated ${uploads} files for user: ${user.email}`);
            }
            else {
                console.warn(`⚠️ No files found for user: ${user.email}`);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed to migrate user: ${user.email}`, message);
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
//# sourceMappingURL=migrateFullFilesToFirebase.js.map