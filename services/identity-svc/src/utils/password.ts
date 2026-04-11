import bcrypt from "bcryptjs";
import { CONFIG } from "./config";

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(CONFIG.AUTH.BCRYPT_ROUNDS);
  return bcrypt.hash(plain, salt);
}

export function comparePassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}
