import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("FATAL: MONGODB_URI is required");
    process.exit(1);
  }
  mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};
