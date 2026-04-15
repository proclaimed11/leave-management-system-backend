import { LeaveRepository } from "../repositories/leaveRepository";
import { LeaveWorkflowRepository } from "../repositories/leaveWorkflowRepository";
import { ApprovalRepository } from "../repositories/approvalRepository";
import { ApprovalHistoryRow } from "../types/approval";
import {
  EmployeeRole,
  UpdateApprovalInput,
  PaginatedResult,
  LeaveApproval,
  PendingApprovalRow,
  LeaveRequestRow,
} from "../types/types";
import { getEmployeeProfile } from "./directoryService";
import { LeaveEngine } from "./leaveEngine";
import { getLeaveTypesWithRules } from "./policyService";
import { mergeRule } from "../validators/leaveValidator";

export class LeaveApprovalEngine {
  constructor(
    private repo = new LeaveWorkflowRepository(),
    private approvalRepo = new ApprovalRepository(),
    private leaveRepo = new LeaveRepository(),
    private leaveEngine = new LeaveEngine(),
  ) {}

  private canViewOrActForScope(
    approver: {
      role: EmployeeRole;
      location?: string | null;
      department_id?: number | null;
      department?: string | null;
    },
    requester: {
      location?: string | null;
      department_id?: number | null;
      department?: string | null;
    },
    options?: {
      strict?: boolean;
    },
  ): boolean {
    const strict = Boolean(options?.strict);

    // HOD must also match requester's department.
    if (approver.role === "hod") {
      const approverDeptName = String(approver.department ?? "")
        .trim()
        .toLowerCase();
      const requesterDeptName = String(requester.department ?? "")
        .trim()
        .toLowerCase();

      // Preferred: strict department_id match when both are available.
      if (
        approver.department_id !== null &&
        approver.department_id !== undefined &&
        requester.department_id !== null &&
        requester.department_id !== undefined
      ) {
        return approver.department_id === requester.department_id;
      }

      // Fallback: compare normalized department names if IDs are absent.
      const byName =
        approverDeptName.length > 0 &&
        requesterDeptName.length > 0 &&
        approverDeptName === requesterDeptName;

      if (byName) return true;

      // For list/history visibility, avoid dropping rows when profile metadata
      // is partially missing; enforce strict check when acting on approvals.
      return strict ? false : true;
    }

    // HR: same country is enough.
    if (approver.role === "hr") {
      return true;
    }

    // Keep non-HOD/HR behavior unchanged.
    return true;
  }

  async getMyPendingApprovals(
    employeeNumber: string,
    role: EmployeeRole,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<any>> {
    const { total, items } = await this.repo.getPendingApprovalsForEmployee(
      employeeNumber,
      role,
      page,
      pageSize,
    );

    if (items.length === 0) {
      return { total, requests: [] };
    }

    const leaveTypes = await getLeaveTypesWithRules();
    const leaveTypeMap = new Map(leaveTypes.map((lt) => [lt.type_key, lt]));

    const uniqueEmpNos = [...new Set(items.map((i) => i.requester_emp_no))];

    const profiles = await Promise.all(
      uniqueEmpNos.map((empNo) =>
        getEmployeeProfile({ employee_number: empNo }),
      ),
    );

    const profileMap = new Map(profiles.map((p) => [p.employee_number, p]));

    const requests = items.map((row) => {
      const profile = profileMap.get(row.requester_emp_no);
      const leaveType = leaveTypeMap.get(row.leave_type_key);

      return {
        approval_id: row.approval_id,
        request_id: row.request_id,

        requester: {
          employee_number: row.requester_emp_no,
          full_name: profile ? `${profile.full_name}` : row.requester_emp_no,
        },

        leave: {
          leave_type_key: row.leave_type_key,
          leave_type_name: leaveType?.type_key ?? row.leave_type_key,
          start_date: row.start_date,
          end_date: row.end_date,
          days_requested: row.total_days,
          reason: row.reason,
        },

        approval: {
          role: row.role,
          step_order: row.step_order,
        },

        applied_at: row.applied_at,
      };
    });

    return {
      total,
      requests,
    };
  }
  async getMyApprovalHistory(
    employeeNumber: string,
    role: EmployeeRole,
    page: number,
    limit: number,
    options?: {
      action?: "APPROVED" | "REJECTED" | "PENDING";
      search?: string;
    },
  ): Promise<PaginatedResult<any>> {
    const { total, items } = await this.approvalRepo.getApprovalHistoryForEmployee(
      employeeNumber,
      role,
      page,
      limit,
      options,
    );

    if (items.length === 0) {
      return { total, requests: [] };
    }

    const leaveTypes = await getLeaveTypesWithRules();
    const leaveTypeMap = new Map(leaveTypes.map((lt) => [lt.type_key, lt]));

    const uniqueEmpNos = [...new Set(items.map((i) => i.requester_emp_no))];

    const profiles = await Promise.all(
      uniqueEmpNos.map((empNo) =>
        getEmployeeProfile({ employee_number: empNo }),
      ),
    );

    const profileMap = new Map(profiles.map((p) => [p.employee_number, p]));

    const requests = items.map((row: ApprovalHistoryRow) => {
      const profile = profileMap.get(row.requester_emp_no);
      const leaveType = leaveTypeMap.get(row.leave_type_key);

      return {
        approval_id: row.approval_id,
        request_id: row.request_id,

        requester: {
          employee_number: row.requester_emp_no,
          full_name: profile ? profile.full_name : row.requester_emp_no,
        },

        leave: {
          leave_type_key: row.leave_type_key,
          leave_type_name: leaveType?.type_key ?? row.leave_type_key,
          start_date: row.start_date,
          end_date: row.end_date,
          days_requested: Number(row.total_days),
          reason: row.reason,
        },

        approval: {
          role: row.role,
          step_order: row.step_order,
          action: row.action,
          acted_at: row.acted_at,
          remarks: row.remarks,
        },

        applied_at: row.applied_at,
      };
    });

    return {
      total,
      requests,
    };
  }
  async getApprovalTrail(requestId: number): Promise<LeaveApproval[]> {
    return this.repo.getApprovalsByRequestId(requestId);
  }

  /**
   * Whether this viewer may act on the current pending step (same rules as POST .../act).
   * Used by GET leave-request/:id so the UI does not depend on duplicated client logic.
   */
  async canViewerActOnRequest(
    requestId: number,
    actor: { employee_number: string; role: EmployeeRole },
  ): Promise<boolean> {
    const leave = await this.leaveRepo.getLeaveRequestById(requestId);
    if (!leave || String(leave.status).toUpperCase() !== "PENDING") {
      return false;
    }
    const pending = await this.repo.getPendingStepsForRequest(requestId);
    for (const step of pending) {
      if (await this.validateActorForCurrentStep(requestId, leave, step, actor)) {
        return true;
      }
    }
    return false;
  }

  private async validateActorForCurrentStep(
    requestId: number,
    leave: LeaveRequestRow,
    step: LeaveApproval,
    actor: { employee_number: string; role: EmployeeRole },
  ): Promise<boolean> {
    const canApprove = await this.repo.canEmployeeApprove(
      requestId,
      step.step_order,
      actor.employee_number,
      actor.role,
    );
    if (!canApprove) {
      return false;
    }

    if (actor.role === "hr" || actor.role === "hod") {
      const [approverProfile, requesterProfile] = await Promise.all([
        getEmployeeProfile({ employee_number: actor.employee_number }),
        getEmployeeProfile({ employee_number: leave.employee_number }),
      ]);

      const scoped = this.canViewOrActForScope(
        {
          role: actor.role,
          location: approverProfile.location ?? null,
          department_id: approverProfile.department_id ?? null,
          department: approverProfile.department ?? null,
        },
        {
          location: requesterProfile.location ?? null,
          department_id: requesterProfile.department_id ?? null,
          department: requesterProfile.department ?? null,
        },
        { strict: true },
      );

      return scoped;
    }

    return true;
  }

  async actOnApproval(
    requestId: number,
    actor: {
      employee_number: string;
      role: EmployeeRole;
    },
    input: UpdateApprovalInput,
  ): Promise<void> {
    const leave = await this.leaveRepo.getLeaveRequestById(requestId);
    if (!leave) throw new Error("Leave request not found");

    const pending = await this.repo.getPendingStepsForRequest(requestId);
    let step: LeaveApproval | null = null;
    for (const s of pending) {
      if (await this.validateActorForCurrentStep(requestId, leave, s, actor)) {
        step = s;
        break;
      }
    }

    if (!step) {
      throw new Error("No pending approval step");
    }

    // When approving: require attachment per policy (requires_document and/or
    // attachment_required_after_days — e.g. medical cert only after N calendar days).
    if (input.action === "APPROVED") {
      if (leave?.leave_type_key) {
        const leaveTypes = await getLeaveTypesWithRules();
        const rawRule = leaveTypes.find((t) => t.type_key === leave.leave_type_key);
        const rule = mergeRule(rawRule);
        const totalDays = Number(leave.total_days);
        const afterRaw = rule.attachment_required_after_days;
        const after =
          afterRaw != null && !Number.isNaN(Number(afterRaw))
            ? Number(afterRaw)
            : null;

        let needAttachment = Boolean(rule.requires_document);
        if (after != null && after > 0) {
          needAttachment = totalDays > after;
        }

        if (needAttachment) {
          const attachments = await this.leaveRepo.getAttachments(requestId);
          if (!attachments?.length) {
            throw new Error(
              "An attachment is required for this leave type before approval (e.g. medical certificate). The employee should upload it on the leave request, or shorten the leave if a document is only required after a minimum number of days.",
            );
          }
        }
      }
    }

    await this.repo.updateApprovalStep(requestId, step.step_order, input);

    if (input.action === "REJECTED") {
      await this.repo.cancelOtherPendingSteps(
        requestId,
        step.step_order,
        actor.employee_number,
      );
      await this.leaveRepo.updateLeaveRequestStatus(requestId, "REJECTED");
      return;
    }

    const hasMoreSteps = await this.repo.hasPendingSteps(requestId);

    if (!hasMoreSteps) {
      await this.leaveEngine.finalizeApprovedLeave(requestId);
    }
  }
}
