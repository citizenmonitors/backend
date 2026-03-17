import mongoose from "mongoose";

function sanitizeMongoUri(uri) {
  if (!uri) return "";
  // Mask credentials in standard mongodb:// URIs
  const masked = uri.replace(/\/\/([^/@]+)@/g, "//***:***@");
  // For mongodb+srv (or any), just ensure we never log credentials if present
  return masked.replace(/\/\/([^/@]+):([^/@]+)@/g, "//***:***@");
}


function resolveMongoUri() {
  const env = process.env.NODE_ENV || "development";

  // Preferred: separate clusters per environment
  if (env === "production") {
    return { uri: process.env.MONGODB_URI_PROD, source: "MONGODB_URI_PROD" };
  }
  if (env === "test") {
    return { uri: process.env.MONGODB_URI_TEST, source: "MONGODB_URI_TEST" };
  }

  if (process.env.MONGODB_URI_DEV) {
    return { uri: process.env.MONGODB_URI_DEV, source: "MONGODB_URI_DEV" };
  }
  return { uri: process.env.MONGODB_URI, source: "MONGODB_URI" };
}

export const connectDB = async () => {
  const { uri: mongoUri, source } = resolveMongoUri();
  const env = process.env.NODE_ENV || "development";

  if (!mongoUri) {
    console.error(
      "FATAL: MongoDB connection string is required. Set MONGODB_URI_DEV / MONGODB_URI_TEST / MONGODB_URI_PROD (or legacy MONGODB_URI)."
    );
    process.exit(1);
  }

  if (env === "production" && source === "MONGODB_URI") {
    console.error(
      "FATAL: Refusing to start in production with legacy MONGODB_URI. Set MONGODB_URI_PROD to your production cluster."
    );
    process.exit(1);
  }

  console.log(
    `[db] NODE_ENV=${env} using ${source})`
  );

  mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};


