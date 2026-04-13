"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uploadPaths_1 = require("../config/uploadPaths");
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const allowedMime = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
function extForMime(mime) {
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
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        (0, uploadPaths_1.ensureAvatarDir)();
        cb(null, (0, uploadPaths_1.avatarDir)());
    },
    filename: (req, file, cb) => {
        const raw = req.params.employee_number ?? "emp";
        const safe = String(raw).replace(/[^a-zA-Z0-9_-]/g, "") || "emp";
        const ext = extForMime(file.mimetype) || path_1.default.extname(file.originalname).slice(0, 8) || ".bin";
        cb(null, `${safe}_${Date.now()}${ext}`);
    },
});
exports.avatarUpload = (0, multer_1.default)({
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
