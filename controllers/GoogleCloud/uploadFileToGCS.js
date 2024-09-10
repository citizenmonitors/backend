import { uploadFileToGCS } from "../../services/GoogleCloud/gcsService";
import fs from "fs";

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload the file to Google Cloud Storage
    const fileUrl = await uploadFileToGCS(req.file);


    return res.status(200).json({ message: "File uploaded successfully", fileUrl });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return res
      .status(500)
      .json({ message: "Failed to upload file", error: error.message });
  }
};