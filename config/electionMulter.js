import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../electionsData");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("electionsData directory created:", uploadDir);
} else {
  console.log("electionsData directory exists:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const allowedExtensions = [".png", ".jpg", ".jpeg", ".svg", ".mp4"];
const allowedMimeTypes = [
  "image/png",
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
        "Only images (png, jpg, jpeg, svg) and videos (mp4) are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

export const uploadResultDataFiles = upload.fields([
  { name: "resultPicture", maxCount: 1 },
  { name: "resultVideo", maxCount: 1 },
]);

// export const uploadIncidentVid = upload.any("incidentVideo");
// export const uploadMultiImg = upload.any(["incidentPictures", "incidentVideo"]);

export const uploadReportDataFiles = upload.fields([
  { name: "incidentPictures[]", maxCount: 5 },
  { name: "incidentVideos[]", maxCount: 5 },
]);
