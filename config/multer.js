import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = [".png", ".jpg", ".jpeg", ".mp4"];
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (png, jpg, jpeg) and videos (mp4) are allowed"));
  }
};

export default multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter,
});
