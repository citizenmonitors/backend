
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

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  // console.log(
  //   "Checking file:",
  //   file.originalname,
  //   "with extension:",
  //   ext,
  //   "and MIME type:",
  //   file.mimetype
  // );

  if (
    allowedExtensions.includes(ext) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images (png, jpg, webp, jpeg, svg) and videos are allowed"
      )
    );
  }
};

// In-memory storage for Firebase uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
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
