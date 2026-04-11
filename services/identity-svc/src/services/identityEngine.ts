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
    user: { id: number; email: string; employee_number: string | null },
    opts: { is_system_admin: boolean }
  ): JwtUser {
    return {
      sub: user.id,
      email: user.email,
      employee_number: user.employee_number,
      is_system_admin: opts.is_system_admin,
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
    });
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
}
