"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVATAR_SUBDIR = exports.UPLOAD_ROOT = void 0;
exports.avatarDir = avatarDir;
exports.ensureAvatarDir = ensureAvatarDir;
exports.publicAvatarPath = publicAvatarPath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/** Root for `express.static` — served at `/uploads`. */
exports.UPLOAD_ROOT = process.env.UPLOAD_ROOT
    ? path_1.default.resolve(process.env.UPLOAD_ROOT)
    : path_1.default.join(process.cwd(), "uploads");
exports.AVATAR_SUBDIR = "avatars";
function avatarDir() {
    return path_1.default.join(exports.UPLOAD_ROOT, exports.AVATAR_SUBDIR);
}
function ensureAvatarDir() {
    fs_1.default.mkdirSync(avatarDir(), { recursive: true });
}
/** Public path stored in `employees.avatar_url` */
function publicAvatarPath(filename) {
    return `/uploads/${exports.AVATAR_SUBDIR}/${filename}`;
}
