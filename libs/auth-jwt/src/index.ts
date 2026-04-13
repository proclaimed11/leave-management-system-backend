import jwt, { SignOptions } from "jsonwebtoken";
import { RequestHandler } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "esl_default_jwt_secret";
/** When set, identity-svc signs access tokens with RS256 — must match identity’s public key. */
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY?.trim();
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";

export interface UserPayload {
  user_id: number;
  employee_number: string;
  email: string;
  role: string;
  /** Identity access tokens may carry these instead of legacy fields. */
  sub?: number;
  is_system_admin?: boolean;
  must_change_password?: boolean;
}

export const signToken = (
  payload: UserPayload,
  secret: string = JWT_SECRET,
  expiresIn: string = JWT_EXPIRES
): string => {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, secret, options);
};

/**
 * Verify an access token from identity-svc.
 * - If `JWT_PUBLIC_KEY` is set → RS256 (same as identity when using keypair).
 * - Otherwise → HS256 with `JWT_SECRET` (must match identity `JWT_SECRET`).
 */
export const verifyToken = (token: string, secret: string = JWT_SECRET): UserPayload => {
  try {
    const useRs256 =
      Boolean(JWT_PUBLIC_KEY) && secret === JWT_SECRET;

    if (useRs256) {
      const decoded = jwt.verify(token, JWT_PUBLIC_KEY as string, {
        algorithms: ["RS256"],
      }) as UserPayload;
      return decoded;
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as UserPayload;
    return decoded;
  } catch (err: any) {
    throw err;
  }
};

/**
 * Require authentication middleware
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Missing Authorization header" });
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = verifyToken(token);

    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Restrict access to users with a specific role
 */
export const requireRole = (role: string): RequestHandler => {
  return (req, res, next) => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (user.role !== role) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      next();
    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
};

/**
 * General token validation middleware
 */
export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const user = verifyToken(token);
    (req as any).user = user;

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
