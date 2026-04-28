import bucket from "./firebaseConfig.js";
import { v4 as uuidv4 } from "uuid";

/** Minimal shape for a file from multer (memory storage). */
interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface FirebaseUploadResult {
  filePath: string;
  publicUrl: string;
  token: string;
}

export const uploadFileToFirebase = async (
  file: MulterFile | undefined,
  folder = "uploads",
  customName: string | null = null
): Promise<FirebaseUploadResult> => {
  try {
    if (!file) throw new Error("No file provided for upload.");
    if (!file.buffer) throw new Error("File buffer is missing.");
    if (!file.mimetype) throw new Error("Invalid file type.");

    const timestamp = Date.now();
    const cleanName = customName ?? `${timestamp}-${file.originalname}`;
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
  } catch (error: unknown) {
    console.error("Firebase Upload Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to upload file: ${message}`);
  }
};
