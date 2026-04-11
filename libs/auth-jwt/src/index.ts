import jwt, { SignOptions } from "jsonwebtoken";
import { RequestHandler } from "express";


const JWT_SECRET = process.env.JWT_SECRET || "esl_default_jwt_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";

export interface UserPayload {
  user_id: number;
  employee_number: string;
  email: string;
  role: string;
}

export const signToken = (
  payload: UserPayload,
  secret: string = JWT_SECRET,
  expiresIn: string = JWT_EXPIRES
): string => {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, secret, options);
};



export const verifyToken = (token: string, secret: string = JWT_SECRET): UserPayload => {
  try {
    const decoded = jwt.verify(token, secret) as UserPayload;
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
