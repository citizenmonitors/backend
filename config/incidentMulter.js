import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../electionsIncident");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("electionsIncident directory created:", uploadDir);
} else {
  console.log("electionsIncident directory exists:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const allowedExtensions = [".png", ".jpg", ".jpeg", ".svg", ".mp4", ];
const allowedMimeTypes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/svg+xml",
  "video/mp4",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  console.log(
    "Checking file:",
    file.originalname,
    "with extension:",
    ext,
    "and MIME type:",
    file.mimetype
  );

  if (
    allowedExtensions.includes(ext) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images (png, jpg, jpeg, svg), videos (mp4) are allowed"
      )
    );
  }
};

const uploadIncidentReport = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
}).fields([
  { name: "incidentPictures", maxCount: 99 },
  { name: "incidentVideos", maxCount: 99 },
]);

const uploadMiddleware = (req, res, next) => {
  uploadIncidentReport(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res
        .status(400)
        .json({ message: "Multer error", error: err.message });
    } else if (err) {
      console.error("Unknown error:", err);
      return res
        .status(400)
        .json({ message: "Unknown error", error: err.message });
    }
    console.log("Files received:", req.files);
    next();
  });
};

export default uploadMiddleware;
