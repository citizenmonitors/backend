import bucket from "../config/firebaseConfig.js";
import { v4 as uuidv4 } from "uuid";

export const uploadFileToFirebase = async (file, folder = "uploads", customName = null) => {
  try {
    if (!file) throw new Error("No file provided for upload.");
    if (!file.buffer) throw new Error("File buffer is missing.");
    if (!file.mimetype) throw new Error("Invalid file type.");

    const timestamp = Date.now();
    const cleanName = customName || `${timestamp}-${file.originalname}`;
    const filePath = `${folder}/${cleanName}`;
    const fileUpload = bucket.file(filePath);

    const token = uuidv4();

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${token}`;

    return {
      filePath,
      publicUrl,
      token,
    };

  } catch (error) {
    console.error("Firebase Upload Error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};
