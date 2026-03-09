


import multer from "multer";
import path from "path";

const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf", ".webp", ".svg"];
const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Please upload a jpg, jpeg, pdf, png, webp, or svg file."));
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

export default upload;
