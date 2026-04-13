"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.requireRole = exports.requireAuth = exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "esl_default_jwt_secret";
/** When set, identity-svc signs access tokens with RS256 — must match identity’s public key. */
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY?.trim();
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";
const signToken = (payload, secret = JWT_SECRET, expiresIn = JWT_EXPIRES) => {
    const options = { expiresIn: expiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.signToken = signToken;
/**
 * Verify an access token from identity-svc.
 * - If `JWT_PUBLIC_KEY` is set → RS256 (same as identity when using keypair).
 * - Otherwise → HS256 with `JWT_SECRET` (must match identity `JWT_SECRET`).
 */
const verifyToken = (token, secret = JWT_SECRET) => {
    try {
        const useRs256 = Boolean(JWT_PUBLIC_KEY) && secret === JWT_SECRET;
        if (useRs256) {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_PUBLIC_KEY, {
                algorithms: ["RS256"],
            });
            return decoded;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret, {
            algorithms: ["HS256"],
        });
        return decoded;
    }
    catch (err) {
        throw err;
    }
};
exports.verifyToken = verifyToken;
/**
 * Require authentication middleware
 */
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: "Missing Authorization header" });
            return;
        }
        const token = authHeader.replace("Bearer ", "").trim();
        const decoded = (0, exports.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.requireAuth = requireAuth;
/**
 * Restrict access to users with a specific role
 */
const requireRole = (role) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            if (user.role !== role) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            next();
        }
        catch (err) {
            res.status(401).json({ error: "Unauthorized" });
        }
    };
};
exports.requireRole = requireRole;
/**
 * General token validation middleware
 */
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        const user = (0, exports.verifyToken)(token);
        req.user = user;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
