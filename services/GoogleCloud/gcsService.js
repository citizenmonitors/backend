// import { Storage } from "@google-cloud/storage";
// // import dotenv from "dotenv";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";

// const gcsConfidential = JSON.parse(process.env.GCS_CREDENTIALS);

// // Initialize Google Cloud Storage
// const storage = new Storage({
//   credentials: gcsConfidential,
//   projectId: gcsConfidential.project_id,
// });

// // Specify the bucket name
// const bucketName = process.env.GCS_BUCKET_NAME;

// // Function to upload files to GCS
// export const uploadFileToGCS = async (files) => {
//   try {
//     let fileUrls = {};

//     // Loop through the files and upload each one
//     for (const fileKey in files) {
//       const file = files[fileKey][0]; 
//       const extension = path.extname(file.originalname);
//       const filename = `${uuidv4()}${extension}`;
//       const destination = `${fileKey}/${filename}`; 

//       // Upload the file to Google Cloud Storage
//       await storage.bucket(bucketName).upload(file.path, {
//         destination,
//         metadata: {
//           contentType: file.mimetype,
//         },
//       });

//       // Handle profileImage (make it publicly accessible)
//       if (fileKey === "profileImage") {
//         await storage.bucket(bucketName).file(destination).makePublic();
//         const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
//         fileUrls.profileImage = publicUrl;

//         // Handle governmentId (generate a signed URL)
//       } else if (fileKey === "governmentId") {
//         const [signedUrl] = await storage
//           .bucket(bucketName)
//           .file(destination)
//           .getSignedUrl({
//             action: "read",
//             expires: Date.now() + 60 * 60 * 1000, 
//           });
//         fileUrls.governmentId = signedUrl;
//       }

     
//       fs.unlinkSync(file.path);
//     }

//     return fileUrls;
//   } catch (error) {
//     console.error("Error uploading files to GCS:", error);
//     throw new Error("Failed to upload files to Google Cloud Storage");
//   }
// };
