


import multer from "multer";
import path from "path";

const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".mp4"];
const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
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
        "Only images (png, jpg, jpeg, webp, svg) and videos (mp4) are allowed"
      )
    );
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

export const uploadIncidentDataFiles = upload.fields([
  { name: "incidentPictures[]", maxCount: 10 },
  { name: "incidentVideos[]", maxCount: 5 },
]);
