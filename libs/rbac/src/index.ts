import type { Request, Response, NextFunction } from "express";

export type DirectoryRole =
  | "employee"
  | "supervisor"
  | "hod"
  | "management"
  | "hr"
  | "admin"
  | "consultant";

export interface RoleAwareRequest extends Request {
  directory_role?: DirectoryRole;
}

export const requireDirectoryRole =
  (allowed: DirectoryRole[]) =>
  (req: RoleAwareRequest, res: Response, next: NextFunction): void => {
    const role = req.directory_role;

    if (!role) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!allowed.includes(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };


export const hrOrAdmin = requireDirectoryRole(["hr", "admin"]);

export const adminOnly = requireDirectoryRole(["admin"]);

export const supervisorOrAbove = requireDirectoryRole([
  "supervisor",
  "hod",
  "management",
  "hr",
  "admin",
]);

export const managementOnly = requireDirectoryRole(["management", "admin"]);

export const staffOnly = requireDirectoryRole([
  "employee",
  "supervisor",
  "hod",
  "management",
  "hr",
  "admin",
]);

export const managerOnly = requireDirectoryRole([
  "supervisor",
  "hod",
  "admin",
]);

export const internalOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const internalKey = req.headers["x-internal-key"];

  if (!internalKey) {
    res.status(401).json({
      error: "Missing internal service key",
    });
  }

  if (internalKey !== process.env.INTERNAL_SERVICE_KEY) {
    res.status(403).json({
      error: "Invalid internal service key",
    });
  }

  next();
};