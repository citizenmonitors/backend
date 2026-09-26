import "dotenv/config";
import mongoose from "mongoose";
import { migrateNewsInsightCoverUrls } from "../utils/newsletterCover.js";
const resolveMongoUri = () => {
    const env = process.env.NODE_ENV || "development";
    if (env === "production")
        return process.env.MONGODB_URI_PROD || "";
    if (env === "test")
        return process.env.MONGODB_URI_TEST || "";
    return process.env.MONGODB_URI_DEV || process.env.MONGODB_URI || "";
};
const run = async () => {
    const uri = resolveMongoUri();
    if (!uri) {
        throw new Error("Set MONGODB_URI_DEV / MONGODB_URI_PROD (or MONGODB_URI).");
    }
    await mongoose.connect(uri);
    const result = await migrateNewsInsightCoverUrls();
    console.log(`News & Insight covers: scanned ${result.scanned}, updated ${result.updated} to Firebase URLs.`);
    await mongoose.disconnect();
};
run().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=migrateNewsInsightCoversToFirebase.js.map