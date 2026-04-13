import crypto from "crypto";
import { OtpRepository } from "../repositories/otpRepository";
import { UserRepository } from "../repositories/userRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { sendOtpEmail } from "../utils/sendOtpEmail";
import { getDirectoryEmployee } from "../client/directoryClient";
import { signJwt, signRefreshToken } from "../utils/jwt";
import type { JwtUser } from "../types/types";

const OTP_EXPIRY_MINUTES = 15;
const MAX_ATTEMPTS = 5;

export class OtpEngine {
  constructor(
    private otpRepo = new OtpRepository(),
    private users = new UserRepository(),
    private refreshTokens = new RefreshTokenRepository()
  ) {}

  async requestOtp(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Normalized Email:", normalizedEmail);

    const employee = await getDirectoryEmployee({ email: normalizedEmail });
    console.log("Fetched Employee:", employee);
    if (!employee || employee.status !== "ACTIVE") {
      throw new Error("Employee not found or inactive");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(otp);

    // Use SHA-256 instead of bcrypt (milliseconds faster)
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Run database insert and email sending in parallel
    await Promise.all([
      this.otpRepo.create({
        email: normalizedEmail,
        otp_hash: otpHash,
        expires_at: expiresAt,
      }),
      sendOtpEmail(normalizedEmail, otp),
    ]);
  }

 async verifyOtp(email: string, otp: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const record = await this.otpRepo.findLatestValid(normalizedEmail);
  if (!record) throw new Error("Invalid or expired OTP");

  if (record.used) throw new Error("OTP already used");
  if (record.attempts >= MAX_ATTEMPTS) throw new Error("Too many attempts");
  if (record.expires_at < new Date()) throw new Error("OTP expired");

  await this.otpRepo.incrementAttempts(record.id);

  // Hash input OTP with SHA-256 and compare
  const inputHash = crypto.createHash('sha256').update(otp).digest('hex');
  const valid = inputHash === record.otp_hash;
  
  if (!valid) throw new Error("Invalid OTP");

  await this.otpRepo.markUsed(record.id);

  // Fetch fresh employee data from directory
  const employee = await getDirectoryEmployee({ email: normalizedEmail });

  if (employee.status !== "ACTIVE") {
    throw new Error("Employee inactive");
  }

  const directoryRole = employee.directory_role.toLowerCase();

  let user = await this.users.findByEmail(normalizedEmail);
  if (!user) {
    // Create new user with fresh data
    user = await this.users.create({
      email: normalizedEmail,
      employee_number: employee.employee_number,
      password_hash: "",
      must_change_password: false,
    });
  } else {
    user = await this.users.update(user.id, {
      employee_number: employee.employee_number,
    });
  }
  
  const isSystemAdmin = false;

  const jwtPayload: JwtUser = {
    sub: user.id,
    email: user.email,
    employee_number: employee.employee_number,
    is_system_admin: isSystemAdmin,
    must_change_password: Boolean(user.must_change_password),
  };

  const token = signJwt(jwtPayload);
  const refreshToken = signRefreshToken({ user_id: user.id });

  await this.refreshTokens.store(
    user.id,
    refreshToken,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      employee_number: employee.employee_number, // Use fresh data here too
      directory_role: directoryRole,
      is_system_admin: isSystemAdmin,
      must_change_password: Boolean(user.must_change_password),
    },
  };
}
}
