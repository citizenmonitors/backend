import multer from "multer";
import path from "path";
import type { Request } from "express";

const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".mp4"];
const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
];

type MulterLikeFile = { originalname: string; mimetype: string };
type FileFilterCb = (error: Error | null, acceptFile?: boolean) => void;

const fileFilter = (_req: Request, file: MulterLikeFile, cb: FileFilterCb) => {
  const ext = path.extname(file.originalname).toLowerCase();
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
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter,
});

export const uploadIncidentDataFiles = upload.fields([
  { name: "incidentPictures[]", maxCount: 10 },
  { name: "incidentVideos[]", maxCount: 5 },
]);
