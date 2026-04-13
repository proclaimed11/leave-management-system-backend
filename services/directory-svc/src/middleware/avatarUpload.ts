import multer from "multer";
import path from "path";

import { avatarDir, ensureAvatarDir } from "../config/uploadPaths";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureAvatarDir();
    cb(null, avatarDir());
  },
  filename: (req, file, cb) => {
    const raw = (req.params as { employee_number?: string }).employee_number ?? "emp";
    const safe = String(raw).replace(/[^a-zA-Z0-9_-]/g, "") || "emp";
    const ext = extForMime(file.mimetype) || path.extname(file.originalname).slice(0, 8) || ".bin";
    cb(null, `${safe}_${Date.now()}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"));
  },
});
