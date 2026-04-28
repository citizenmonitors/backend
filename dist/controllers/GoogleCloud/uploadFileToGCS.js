// import { uploadFilesToGCS } from "../../services/GoogleCloud/gcsService";
export {};
// export const uploadFileController = async (req, res) => {
//   try {
//     // Check if files are present in the request
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }
//     // Extract folder name from query or set a default
//     const folder = req.query.folder || "general";
//     // Upload files to Google Cloud Storage
//     const fileUrls = await uploadFilesToGCS(req.files, folder);
//     return res.status(200).json({
//       message: "Files uploaded successfully",
//       fileUrls,
//     });
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     return res.status(500).json({
//       message: "Failed to upload files",
//       error: error.message,
//     });
//   }
// };
//# sourceMappingURL=uploadFileToGCS.js.map