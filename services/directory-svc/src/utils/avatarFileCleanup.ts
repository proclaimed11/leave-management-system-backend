import fs from "fs";
import path from "path";

/** Remove a file previously stored under project `uploads/avatars/` (by public path). */
export function tryRemoveStoredAvatar(avatarUrl: string | null | undefined): void {
  if (!avatarUrl) return;
  const m = avatarUrl.match(/^\/uploads\/avatars\/([a-zA-Z0-9._-]+)$/);
  if (!m) return;
  const full = path.join(process.cwd(), "uploads", "avatars", m[1]);
  const resolved = path.resolve(full);
  const avRoot = path.resolve(process.cwd(), "uploads", "avatars");
  if (!resolved.startsWith(avRoot)) return;
  try {
    fs.unlinkSync(resolved);
  } catch {
    /* ignore */
  }
}
