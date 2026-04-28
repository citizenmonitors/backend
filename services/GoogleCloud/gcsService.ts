// This service is currently unused (the implementation was left commented-out in the original JS).
// Keeping the file as TypeScript so the migration can proceed incrementally.
//
// import { Storage } from "@google-cloud/storage";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";
//
// // Parse GCS credentials from environment variable
// const gcsConfidential = JSON.parse(process.env.GCS_CREDENTIALS || "{}");
//
// // Initialize Google Cloud Storage
// const storage = new Storage({
//   credentials: gcsConfidential,
//   projectId: gcsConfidential.project_id,
// });
//
// // Specify the bucket name
// const bucketName = process.env.GCS_BUCKET_NAME;
//
// // Function to upload files to GCS with folders
// export const uploadFilesToGCS = async (files: unknown, folder: string) => {
//   try {
//     const fileUrls: Record<string, string> = {};
//
//     for (const fileKey in files) {
//       const file = files[fileKey][0]; // Only handle the first file for each key
//       const extension = path.extname(file.originalname); // Get file extension
//       const filename = `${uuidv4()}${extension}`; // Generate unique filename
//       const destination = `${folder}/${fileKey}/${filename}`; // Define GCS path
//
//       await storage.bucket(bucketName as string).upload(file.path, {
//         destination,
//         metadata: {
//           contentType: file.mimetype,
//         },
//       });
//
//       const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
//       fileUrls[fileKey] = publicUrl;
//
//       fs.unlinkSync(file.path);
//     }
//
//     return fileUrls;
//   } catch (error) {
//     console.error("Error uploading files to GCS:", error);
//     throw new Error("Failed to upload files to Google Cloud Storage");
//   }
// };

