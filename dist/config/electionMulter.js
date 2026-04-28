import multer from "multer";
import path from "path";
const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".mp4", ".avi", ".mov", ".webm", ".wmv"];
const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/x-msvideo",
    "video/quicktime",
    "video/webm",
    "video/x-ms-wmv",
];
const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext) &&
        allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only images (png, jpg, webp, jpeg, svg) and videos are allowed"));
    }
};
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    fileFilter,
});
export const uploadResultDataFiles = upload.fields([
    { name: "resultPicture", maxCount: 1 },
    { name: "resultVideo", maxCount: 1 },
]);
export const uploadReportDataFiles = upload.fields([
    { name: "incidentPictures[]", maxCount: 5 },
    { name: "incidentVideos[]", maxCount: 5 },
]);
export const uploadCollationDiscussionFiles = upload.fields([
    { name: "images[]", maxCount: 6 },
    { name: "videos[]", maxCount: 3 },
]);
export const uploadPulsePostFiles = upload.fields([
    { name: "image", maxCount: 1 },
]);
//# sourceMappingURL=electionMulter.js.map