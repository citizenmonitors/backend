import multer from "multer";
import path from "path";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;
const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];
const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
];
const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
    }
    cb(new Error("Only images (png, jpg, jpeg, webp) and PDF files are allowed"));
};
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
});
export const uploadPvcIssuesEvidence = upload.fields([
    { name: "evidence[]", maxCount: MAX_FILES },
    { name: "evidence", maxCount: MAX_FILES },
]);
//# sourceMappingURL=pvcIssuesMulter.js.map