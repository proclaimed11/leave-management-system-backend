import fs from "fs";
import path from "path";

/** Root for `express.static` — served at `/uploads`. */
export const UPLOAD_ROOT = process.env.UPLOAD_ROOT
  ? path.resolve(process.env.UPLOAD_ROOT)
  : path.join(process.cwd(), "uploads");

export const AVATAR_SUBDIR = "avatars";

export function avatarDir(): string {
  return path.join(UPLOAD_ROOT, AVATAR_SUBDIR);
}

export function ensureAvatarDir(): void {
  fs.mkdirSync(avatarDir(), { recursive: true });
}

/** Public path stored in `employees.avatar_url` */
export function publicAvatarPath(filename: string): string {
  return `/uploads/${AVATAR_SUBDIR}/${filename}`;
}
