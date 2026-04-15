import { Request, Response, NextFunction } from "express";
import { EmployeeEngine } from "../services/employeeEngine";

type VisibilityScope =
  | { mode: "all" }
  | { mode: "none" }
  | { mode: "location"; location_prefix: string }
  | { mode: "location_department"; location_prefix: string; department: string };

function getLocationPrefix(location: string | null | undefined): string | null {
  const raw = String(location ?? "").trim().toUpperCase();
  if (!raw) return null;
  const prefix = raw.split("_")[0]?.trim();
  return prefix || null;
}

const engine = new EmployeeEngine();

/**
 * Resolves data-visibility scope for "users table" access.
 * - admin/system_admin: all
 * - hr/management: same location prefix (e.g. TZ_*)
 * - hod/supervisor: same location prefix + same department
 * - employee/consultant: none
 */
export async function resolveEmployeeVisibilityScope(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const me = (req as any).user;
    const role = String((req as any).directory_role ?? "").toLowerCase().trim();

    if (me?.is_system_admin === true || role === "admin") {
      (req as any).employee_visibility_scope = { mode: "all" } as VisibilityScope;
      return next();
    }

    if (role === "employee" || role === "consultant") {
      (req as any).employee_visibility_scope = { mode: "none" } as VisibilityScope;
      return next();
    }

    const requesterEmpNo = String(me?.employee_number ?? "").trim();
    if (!requesterEmpNo) {
      res.status(403).json({ error: "Employee context required" });
      return;
    }

    const requester = await engine.getById(requesterEmpNo);
    if (!requester) {
      res.status(403).json({ error: "Requester employee profile not found" });
      return;
    }

    const locationPrefix = getLocationPrefix(requester.location);
    if (!locationPrefix) {
      res.status(403).json({ error: "Requester location is not configured" });
      return;
    }

    if (role === "hod" || role === "supervisor") {
      const department = String(requester.department ?? "").trim();
      if (!department) {
        res.status(403).json({ error: "Supervisor/HOD department is not configured" });
        return;
      }
      (req as any).employee_visibility_scope = {
        mode: "location_department",
        location_prefix: locationPrefix,
        department,
      } as VisibilityScope;
      return next();
    }

    if (role === "hr" || role === "management") {
      (req as any).employee_visibility_scope = {
        mode: "location",
        location_prefix: locationPrefix,
      } as VisibilityScope;
      return next();
    }

    (req as any).employee_visibility_scope = { mode: "none" } as VisibilityScope;
    return next();
  } catch (err) {
    console.error("Failed to resolve employee visibility scope", err);
    res.status(500).json({ error: "Failed to resolve data visibility scope" });
  }
}
