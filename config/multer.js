


import multer from "multer";
import path from "path";

// Validate file extensions
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = [".png", ".jpg", ".jpeg", ".pdf", ".webp", ".svg"];
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Please upload a jpg, jpeg, pdf, png, webp, or svg file."));
  }
};

// Use memory storage
const storage = multer.memoryStorage();

// Configure multer instance
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

export default upload;
