import crypto from "crypto";
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/userRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import {
  signJwt,
  signRefreshToken,
  verifyJwt,
  verifyRefreshToken,
} from "../utils/jwt";
import { CONFIG } from "../utils/config";
import { JwtUser, LoginRequest, LoginResult, UserRow } from "../types/types";

export class IdentityEngine {
  constructor(
    private users = new UserRepository(),
    private refreshTokens = new RefreshTokenRepository()
  ) {}

  private async hashPassword(plain: string): Promise<string> {
    const rounds = Number(CONFIG.PASSWORD_SALT_ROUNDS ?? 10);
    return bcrypt.hash(plain, rounds);
  }

  private async comparePassword(
    plain: string,
    hash: string | null
  ): Promise<boolean> {
    if (!hash) return false;
    return bcrypt.compare(plain, hash);
  }

  private ensureActive(user: UserRow) {
    if (!user.is_active) {
      throw new Error("Account is disabled. Contact administrator.");
    }
  }

  private isSystemAdminEmail(email: string): boolean {
    const configured = process.env.SYSTEM_ADMIN_EMAIL?.toLowerCase().trim();
    if (!configured) return false; // fail closed if not configured
    return email.toLowerCase().trim() === configured;
  }

  private buildJwtUser(
    user: {
      id: number;
      email: string;
      employee_number: string | null;
      must_change_password?: boolean;
    },
    opts: { is_system_admin: boolean }
  ): JwtUser {
    return {
      sub: user.id,
      email: user.email,
      employee_number: user.employee_number,
      is_system_admin: opts.is_system_admin,
      must_change_password: Boolean(user.must_change_password),
    };
  }

  private issueToken(payload: JwtUser): string {
    return signJwt(payload, {
      expiresIn: CONFIG.AUTH.JWT_EXPIRES_IN as any,
    });
  }

  private async issueRefreshToken(userId: number): Promise<string> {
    const token = signRefreshToken({ user_id: userId });

    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days
    await this.refreshTokens.store(userId, token, expiresAt);

    return token;
  }

  async loginWithPassword(input: LoginRequest): Promise<LoginResult> {
    const email = input.email?.toLowerCase().trim();
    const password = input.password ?? "";

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    this.ensureActive(user);

    const ok = await this.comparePassword(password, user.password_hash);
    if (!ok) {
      throw new Error("Invalid email or password");
    }

    // 🔑 SYSTEM ADMIN FLAG (identity-level only)
    const isSystemAdmin = this.isSystemAdminEmail(user.email);

    const jwtUser = this.buildJwtUser(user, {
      is_system_admin: isSystemAdmin,
    });

    const token = this.issueToken(jwtUser);
    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        employee_number: user.employee_number,
        email: user.email,
        is_system_admin: isSystemAdmin,
        must_change_password: Boolean(user.must_change_password),
      },
    };
  }

  /**
   * SSO handoff (email already verified by IdP)
   * Call this after verifying Azure AD token upstream.
   */
  async loginWithSso(verifiedEmail: string): Promise<LoginResult> {
    const email = verifiedEmail.toLowerCase().trim();

    const user = await this.users.findByEmail(email);
    if (!user) {
      // JIT provisioning is optional; fail closed by default
      throw new Error("User not provisioned in LMS");
    }

    this.ensureActive(user);

    const isSystemAdmin = this.isSystemAdminEmail(user.email);

    const jwtUser = this.buildJwtUser(user, {
      is_system_admin: isSystemAdmin,
    });

    const token = this.issueToken(jwtUser);
    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        employee_number: user.employee_number,
        email: user.email,
        is_system_admin: isSystemAdmin,
        must_change_password: Boolean(user.must_change_password),
      },
    };
  }

  async getCurrentUserFromAuthHeader(authHeader?: string): Promise<JwtUser> {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Missing or invalid Authorization header");
    }
    const token = authHeader.slice("Bearer ".length).trim();
    return verifyJwt<JwtUser>(token);
  }

  /** Ensures `must_change_password` reflects the database (JWT may be stale). */
  async mergeMustChangePasswordFromDb(jwtUser: JwtUser): Promise<JwtUser> {
    const row = await this.users.findById(jwtUser.sub);
    if (!row) return jwtUser;
    return {
      ...jwtUser,
      must_change_password: Boolean(row.must_change_password),
    };
  }

  async registerLocalUser(data: {
    employee_number: string | null;
    email: string;
    password: string;
  }) {
    const email = data.email.toLowerCase().trim();

    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error("User with this email already exists");

    const password_hash = await this.hashPassword(data.password);

    return this.users.create({
      employee_number: data.employee_number,
      email,
      password_hash,
      must_change_password: false,
    });
  }

  /**
   * Service-to-service: create a local user with a random initial password (directory hire).
   */
  async provisionUserFromDirectory(input: {
    employee_number: string;
    email: string;
    password?: string;
    must_change_password?: boolean;
    allow_existing?: boolean;
  }): Promise<{ user: LoginResult["user"]; temporary_password: string }> {
    const email = input.email.toLowerCase().trim();
    const employee_number = input.employee_number?.trim() || null;
    if (!email) throw new Error("email is required");
    if (!employee_number) throw new Error("employee_number is required");

    const plainPassword =
      typeof input.password === "string" && input.password.trim()
        ? input.password.trim()
        : crypto.randomBytes(18).toString("base64url");
    const mustChange = input.must_change_password ?? (input.password ? false : true);
    const allowExisting = input.allow_existing === true;

    const existing = await this.users.findByEmail(email);
    let row: UserRow;
    if (existing && !allowExisting) {
      throw new Error("User with this email already exists");
    }

    if (existing && allowExisting) {
      const password_hash = await this.hashPassword(plainPassword);
      row = await this.users.update(existing.id, {
        employee_number,
        password_hash,
        must_change_password: mustChange,
      });
    } else {
      const password_hash = await this.hashPassword(plainPassword);
      row = await this.users.create({
        employee_number,
        email,
        password_hash,
        must_change_password: mustChange,
      });
    }

    const isSystemAdmin = this.isSystemAdminEmail(row.email);

    return {
      user: {
        id: row.id,
        employee_number: row.employee_number,
        email: row.email,
        is_system_admin: isSystemAdmin,
        must_change_password: Boolean(row.must_change_password),
      },
      temporary_password: plainPassword,
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<LoginResult> {
    const nextPlain = (newPassword ?? "").trim();
    if (nextPlain.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    const user = await this.users.findById(userId);
    if (!user) throw new Error("User not found");
    this.ensureActive(user);

    if (!user.password_hash) {
      throw new Error("Password change is not available for this account");
    }

    const ok = await this.comparePassword(currentPassword ?? "", user.password_hash);
    if (!ok) throw new Error("Current password is incorrect");

    const password_hash = await this.hashPassword(nextPlain);
    await this.users.update(user.id, {
      password_hash,
      must_change_password: false,
    });

    const fresh = await this.users.findById(user.id);
    if (!fresh) throw new Error("User not found");

    const isSystemAdmin = this.isSystemAdminEmail(fresh.email);
    const jwtUser = this.buildJwtUser(fresh, {
      is_system_admin: isSystemAdmin,
    });

    const token = this.issueToken(jwtUser);
    const refreshToken = await this.issueRefreshToken(fresh.id);

    return {
      token,
      refreshToken,
      user: {
        id: fresh.id,
        employee_number: fresh.employee_number,
        email: fresh.email,
        is_system_admin: isSystemAdmin,
        must_change_password: false,
      },
    };
  }

  async deactivateUser(userId: number): Promise<void> {
    await this.users.deactivate(userId);
  }

  /**
   * Optional helper: issue access token for a user (e.g. admin ops)
   * Still NO roles; only identity claims + system-admin flag.
   */
  async issueTokenForUser(userId: number): Promise<string> {
    const user = await this.users.findById(userId);
    if (!user) throw new Error("User not found");
    this.ensureActive(user);

    const isSystemAdmin = this.isSystemAdminEmail(user.email);
    const jwtUser = this.buildJwtUser(user, {
      is_system_admin: isSystemAdmin,
    });

    return this.issueToken(jwtUser);
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ token: string; refresh_token: string }> {
    const stored = await this.refreshTokens.find(refreshToken);
    if (!stored) throw new Error("Invalid refresh token");

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new Error("Refresh token expired or invalid");
    }

    const user = await this.users.findById(decoded.user_id);
    if (!user) throw new Error("User not found");
    this.ensureActive(user);

    const isSystemAdmin = this.isSystemAdminEmail(user.email);

    const newAccessToken = this.issueToken(
      this.buildJwtUser(user, { is_system_admin: isSystemAdmin })
    );
    const newRefreshToken = await this.issueRefreshToken(user.id);

    await this.refreshTokens.revoke(refreshToken);

    return {
      token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokens.revoke(refreshToken);
  }

  async logoutAll(userId: number): Promise<void> {
    await this.refreshTokens.revokeAll(userId);
  }

  /**
   * Service-to-service: remove LMS user when directory hard-deletes an archived employee.
   * Matches both email and employee_number. No-op if no row matches. Refuses system admin email.
   */
  async deleteUserByDirectoryHandoff(input: {
    email: string;
    employee_number: string;
  }): Promise<{ deleted: boolean }> {
    const email = input.email.toLowerCase().trim();
    const employee_number = input.employee_number?.trim() || "";
    if (!email || !employee_number) {
      throw new Error("email and employee_number are required");
    }

    if (this.isSystemAdminEmail(email)) {
      throw new Error("Refusing to delete system administrator account");
    }

    const deleted = await this.users.deleteByEmailAndEmployeeNumber(
      email,
      employee_number
    );
    return { deleted };
  }
}
