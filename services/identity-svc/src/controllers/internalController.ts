import { Request, Response } from "express";
import { IdentityEngine } from "../services/identityEngine";
import { CONFIG } from "../utils/config";

const engine = new IdentityEngine();

function assertServiceAuth(req: Request): boolean {
  const raw = req.headers["x-service-auth"];
  const incoming = typeof raw === "string" ? raw.trim() : "";
  const expected = String(CONFIG.SERVICE_AUTH_TOKEN ?? "").trim();
  return Boolean(incoming) && incoming === expected;
}

/**
 * POST /auth/internal/provision-user
 * Called by directory-svc when an employee is created (X-Service-Auth).
 */
export const provisionUser = async (req: Request, res: Response) => {
  try {
    if (!assertServiceAuth(req)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const body = req.body ?? {};
    const email = String(body.email ?? "").trim();
    const employee_number = String(body.employee_number ?? "").trim();

    const result = await engine.provisionUserFromDirectory({
      employee_number,
      email,
    });

    return res.status(201).json({
      message: "User provisioned",
      user: result.user,
      temporary_password: result.temporary_password,
      user_created: true,
    });
  } catch (err: any) {
    const msg = String(err?.message ?? "Provision failed");
    const status =
      /already exists/i.test(msg) ? 409 : /required/i.test(msg) ? 422 : 400;
    return res.status(status).json({ error: msg, user_created: false });
  }
};

/**
 * POST /auth/internal/delete-user-for-employee
 * Called by directory-svc after permanently deleting an archived employee.
 */
export const deleteUserForDirectoryEmployee = async (req: Request, res: Response) => {
  try {
    if (!assertServiceAuth(req)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const body = req.body ?? {};
    const email = String(body.email ?? "").trim();
    const employee_number = String(body.employee_number ?? "").trim();

    const result = await engine.deleteUserByDirectoryHandoff({
      email,
      employee_number,
    });

    return res.json({
      message: result.deleted
        ? "Identity user deleted"
        : "No matching identity user",
      deleted: result.deleted,
    });
  } catch (err: any) {
    const msg = String(err?.message ?? "Delete failed");
    const status = /required|Refusing/i.test(msg) ? 422 : 400;
    return res.status(status).json({ error: msg });
  }
};
