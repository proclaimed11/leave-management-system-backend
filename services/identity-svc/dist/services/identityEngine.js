"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEngine = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userRepository_1 = require("../repositories/userRepository");
const refreshTokenRepository_1 = require("../repositories/refreshTokenRepository");
const jwt_1 = require("../utils/jwt");
const config_1 = require("../utils/config");
class IdentityEngine {
    users;
    refreshTokens;
    constructor(users = new userRepository_1.UserRepository(), refreshTokens = new refreshTokenRepository_1.RefreshTokenRepository()) {
        this.users = users;
        this.refreshTokens = refreshTokens;
    }
    async hashPassword(plain) {
        const rounds = Number(config_1.CONFIG.PASSWORD_SALT_ROUNDS ?? 10);
        return bcryptjs_1.default.hash(plain, rounds);
    }
    async comparePassword(plain, hash) {
        if (!hash)
            return false;
        return bcryptjs_1.default.compare(plain, hash);
    }
    ensureActive(user) {
        if (!user.is_active) {
            throw new Error("Account is disabled. Contact administrator.");
        }
    }
    isSystemAdminEmail(email) {
        const configured = process.env.SYSTEM_ADMIN_EMAIL?.toLowerCase().trim();
        if (!configured)
            return false; // fail closed if not configured
        return email.toLowerCase().trim() === configured;
    }
    buildJwtUser(user, opts) {
        return {
            sub: user.id,
            email: user.email,
            employee_number: user.employee_number,
            is_system_admin: opts.is_system_admin,
            must_change_password: Boolean(user.must_change_password),
        };
    }
    issueToken(payload) {
        return (0, jwt_1.signJwt)(payload, {
            expiresIn: config_1.CONFIG.AUTH.JWT_EXPIRES_IN,
        });
    }
    async issueRefreshToken(userId) {
        const token = (0, jwt_1.signRefreshToken)({ user_id: userId });
        const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days
        await this.refreshTokens.store(userId, token, expiresAt);
        return token;
    }
    async loginWithPassword(input) {
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
    async loginWithSso(verifiedEmail) {
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
    async getCurrentUserFromAuthHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Missing or invalid Authorization header");
        }
        const token = authHeader.slice("Bearer ".length).trim();
        return (0, jwt_1.verifyJwt)(token);
    }
    /** Ensures `must_change_password` reflects the database (JWT may be stale). */
    async mergeMustChangePasswordFromDb(jwtUser) {
        const row = await this.users.findById(jwtUser.sub);
        if (!row)
            return jwtUser;
        return {
            ...jwtUser,
            must_change_password: Boolean(row.must_change_password),
        };
    }
    async registerLocalUser(data) {
        const email = data.email.toLowerCase().trim();
        const existing = await this.users.findByEmail(email);
        if (existing)
            throw new Error("User with this email already exists");
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
    async provisionUserFromDirectory(input) {
        const email = input.email.toLowerCase().trim();
        const employee_number = input.employee_number?.trim() || null;
        if (!email)
            throw new Error("email is required");
        if (!employee_number)
            throw new Error("employee_number is required");
        const existing = await this.users.findByEmail(email);
        if (existing)
            throw new Error("User with this email already exists");
        const temporary_password = crypto_1.default.randomBytes(18).toString("base64url");
        const password_hash = await this.hashPassword(temporary_password);
        const row = await this.users.create({
            employee_number,
            email,
            password_hash,
            must_change_password: true,
        });
        const isSystemAdmin = this.isSystemAdminEmail(row.email);
        return {
            user: {
                id: row.id,
                employee_number: row.employee_number,
                email: row.email,
                is_system_admin: isSystemAdmin,
                must_change_password: true,
            },
            temporary_password,
        };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const nextPlain = (newPassword ?? "").trim();
        if (nextPlain.length < 8) {
            throw new Error("New password must be at least 8 characters");
        }
        const user = await this.users.findById(userId);
        if (!user)
            throw new Error("User not found");
        this.ensureActive(user);
        if (!user.password_hash) {
            throw new Error("Password change is not available for this account");
        }
        const ok = await this.comparePassword(currentPassword ?? "", user.password_hash);
        if (!ok)
            throw new Error("Current password is incorrect");
        const password_hash = await this.hashPassword(nextPlain);
        await this.users.update(user.id, {
            password_hash,
            must_change_password: false,
        });
        const fresh = await this.users.findById(user.id);
        if (!fresh)
            throw new Error("User not found");
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
    async deactivateUser(userId) {
        await this.users.deactivate(userId);
    }
    /**
     * Optional helper: issue access token for a user (e.g. admin ops)
     * Still NO roles; only identity claims + system-admin flag.
     */
    async issueTokenForUser(userId) {
        const user = await this.users.findById(userId);
        if (!user)
            throw new Error("User not found");
        this.ensureActive(user);
        const isSystemAdmin = this.isSystemAdminEmail(user.email);
        const jwtUser = this.buildJwtUser(user, {
            is_system_admin: isSystemAdmin,
        });
        return this.issueToken(jwtUser);
    }
    async refreshAccessToken(refreshToken) {
        const stored = await this.refreshTokens.find(refreshToken);
        if (!stored)
            throw new Error("Invalid refresh token");
        let decoded;
        try {
            decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new Error("Refresh token expired or invalid");
        }
        const user = await this.users.findById(decoded.user_id);
        if (!user)
            throw new Error("User not found");
        this.ensureActive(user);
        const isSystemAdmin = this.isSystemAdminEmail(user.email);
        const newAccessToken = this.issueToken(this.buildJwtUser(user, { is_system_admin: isSystemAdmin }));
        const newRefreshToken = await this.issueRefreshToken(user.id);
        await this.refreshTokens.revoke(refreshToken);
        return {
            token: newAccessToken,
            refresh_token: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        await this.refreshTokens.revoke(refreshToken);
    }
    async logoutAll(userId) {
        await this.refreshTokens.revokeAll(userId);
    }
    /**
     * Service-to-service: remove LMS user when directory hard-deletes an archived employee.
     * Matches both email and employee_number. No-op if no row matches. Refuses system admin email.
     */
    async deleteUserByDirectoryHandoff(input) {
        const email = input.email.toLowerCase().trim();
        const employee_number = input.employee_number?.trim() || "";
        if (!email || !employee_number) {
            throw new Error("email and employee_number are required");
        }
        if (this.isSystemAdminEmail(email)) {
            throw new Error("Refusing to delete system administrator account");
        }
        const deleted = await this.users.deleteByEmailAndEmployeeNumber(email, employee_number);
        return { deleted };
    }
}
exports.IdentityEngine = IdentityEngine;
