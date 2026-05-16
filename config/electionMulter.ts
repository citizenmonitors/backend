import multer from "multer";
import path from "path";
import type { NextFunction, Request, Response } from "express";

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
        "Only images (png, jpg, webp, jpeg, svg) and videos are allowed"
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

const newsPressImageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
const newsPressImageMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

const newsPressImageFilter = (_req: Request, file: MulterLikeFile, cb: FileFilterCb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (newsPressImageExtensions.includes(ext) && newsPressImageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Thumbnail and hero must be images: png, jpg, jpeg, webp, or svg"));
  }
};

const uploadNewsPress = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: newsPressImageFilter,
});

type MulterFields = (fields: { name: string; maxCount: number }[]) => import("express").RequestHandler;

/** Admin create News / Press — file fields: `thumbnail` (+ optional hero under any accepted alias). */
export const uploadNewsPressAdminImages = (uploadNewsPress as unknown as { fields: MulterFields }).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "thumbnailUrl", maxCount: 1 },
  { name: "heroImage", maxCount: 1 },
  { name: "heroImageURL", maxCount: 1 },
  { name: "heroImageUrl", maxCount: 1 },
]);

export const runNewsPressAdminUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadNewsPressAdminImages(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Unexpected field")) {
        return res.status(400).json({
          message:
            'Upload: unexpected file field. Use form-data files named "thumbnail" (required) and optionally "heroImage" or "heroImageURL".',
        });
      }
      return res.status(400).json({ message: `Upload: ${message}` });
    }
    next();
  });
};

/** Parses multipart form-data (text fields + image files). Skips for JSON bodies. */
export const parseNewsPressAdminMultipart = (req: Request, res: Response, next: NextFunction) => {
  const ct = String(req.headers["content-type"] ?? "").toLowerCase();
  if (ct.includes("multipart/form-data")) {
    return runNewsPressAdminUpload(req, res, next);
  }
  next();
};

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

/** Optional evidence when flagging another user's result or incident (polling-unit verification). */
export const uploadFlagEvidenceFiles = upload.fields([
  { name: "flagImage", maxCount: 1 },
  { name: "flagVideo", maxCount: 1 },
]);
