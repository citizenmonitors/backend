import { uploadFileToGCS } from "../../services/GoogleCloud/gcsService";
import fs from "fs";

export const uploadFileController = async (req, res) => {
try {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  // Upload files to Google Cloud Storage
  const fileUrls = await uploadFileToGCS(req.files);

  return res
    .status(200)
    .json({ message: "Files uploaded successfully", fileUrls });
} catch (error) {
  console.error("Error uploading file:", error);
  return res
    .status(500)
    .json({ message: "Failed to upload files", error: error.message });
}
};
