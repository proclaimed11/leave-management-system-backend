import { Response } from "express";
import { dashboardEngineInstance } from "../services/dashboardEngine";
import { LeaveApprovalEngine } from "../services/leaveApprovalEngine";
import { EmployeeRole, JwtUser } from "../types/types";
import { AuthRequest } from "../types/authRequest";
import { mapDirectoryRoleToEmployeeRole } from "../types/roleMapper";
import { isClientError } from "../utils/errorClassifier";

const engine = new LeaveApprovalEngine();

function getRoleForApproval(req: AuthRequest): EmployeeRole {
  const directoryRole = (req as any).directory_role as string | undefined;
  if (directoryRole) return mapDirectoryRoleToEmployeeRole(directoryRole);
  const user = (req as any).user as JwtUser;
  return (user?.role as EmployeeRole) ?? "employee";
}

export async function getMyPendingApprovals(req: AuthRequest, res: Response) {
  const user = (req as any).user as JwtUser;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 25);

  const result = await engine.getMyPendingApprovals(
    user.employee_number,
    getRoleForApproval(req),
    page,
    limit,
  );

  const count = result.requests.length;
  const total = result.total;
  const total_pages = Math.ceil(total / limit);

  return res.json({
    page,
    limit,
    count,
    total,
    total_pages,
    data: result.requests,
  });
}
export async function getMyApprovalHistory(req: AuthRequest, res: Response) {
  try {
    const user = (req as any).user;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 25);

    const action =
      req.query.action &&
      ["APPROVED", "REJECTED", "PENDING"].includes(
        String(req.query.action).toUpperCase(),
      )
        ? (String(req.query.action).toUpperCase() as
            | "APPROVED"
            | "REJECTED"
            | "PENDING")
        : undefined;

    const search =
      typeof req.query.search === "string" && req.query.search.trim()
        ? req.query.search.trim()
        : undefined;

    const result = await engine.getMyApprovalHistory(
      user.employee_number,
      getRoleForApproval(req),
      page,
      limit,
      { action, search },
    );

    const count = result.requests.length;
    const total = result.total;
    const total_pages = Math.ceil(total / limit);

    return res.json({
      page,
      limit,
      count,
      total,
      total_pages,
      data: result.requests,
    });
  } catch (err: any) {
    console.error("getMyApprovalHistory error:", err);
    return res.status(500).json({
      error: err.message ?? "Failed to load approval history",
    });
  }
}
export async function getApprovalTrail(req: AuthRequest, res: Response) {
  const requestId = Number(req.params.requestId);

  const approvals = await engine.getApprovalTrail(requestId);

  return res.json(approvals);
}

export async function actOnApproval(req: AuthRequest, res: Response) {
  try {
    const me = (req as any).user as JwtUser;
    const requestId = Number(req.params.requestId);
    const { action, remarks } = req.body;

    await engine.actOnApproval(
      requestId,
      {
        employee_number: me.employee_number,
        role: getRoleForApproval(req),
      },
      {
        action,
        approver_emp_no: me.employee_number,
        remarks,
      },
    );

    dashboardEngineInstance.invalidateHrDashboardCache();

    return res.json({ message: "Approval updated successfully" });
  } catch (err: any) {
    const msg = err?.message ?? "Approval failed";
    const lower = String(msg).toLowerCase();
    const code =
      /not authorized|unauthorized|forbidden/.test(lower)
        ? 403
        : isClientError(msg)
          ? 400
          : 500;
    if (code >= 500) {
      console.error("actOnApproval error:", err);
    }
    return res.status(code).json({ error: msg });
  }
}
