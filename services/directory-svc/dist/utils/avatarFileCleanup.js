"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryRemoveStoredAvatar = tryRemoveStoredAvatar;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/** Remove a file previously stored under project `uploads/avatars/` (by public path). */
function tryRemoveStoredAvatar(avatarUrl) {
    if (!avatarUrl)
        return;
    const m = avatarUrl.match(/^\/uploads\/avatars\/([a-zA-Z0-9._-]+)$/);
    if (!m)
        return;
    const full = path_1.default.join(process.cwd(), "uploads", "avatars", m[1]);
    const resolved = path_1.default.resolve(full);
    const avRoot = path_1.default.resolve(process.cwd(), "uploads", "avatars");
    if (!resolved.startsWith(avRoot))
        return;
    try {
        fs_1.default.unlinkSync(resolved);
    }
    catch {
        /* ignore */
    }
}
