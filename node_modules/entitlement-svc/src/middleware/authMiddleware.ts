import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@libs/auth-jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = header.split(" ")[1];

    const payload = verifyToken(token, process.env.JWT_SECRET!);

    (req as any).user = payload;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
