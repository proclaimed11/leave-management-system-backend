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
    const { total, items } =
      await this.approvalRepo.getApprovalHistoryForEmployee(
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

  async actOnApproval(
    requestId: number,
    actor: {
      employee_number: string;
      role: EmployeeRole;
    },
    input: UpdateApprovalInput,
  ): Promise<void> {
    const step = await this.repo.getNextPendingStep(requestId);

    if (!step) {
      throw new Error("No pending approval step");
    }

    const canApprove = await this.repo.canEmployeeApprove(
      requestId,
      step.step_order,
      actor.employee_number,
      actor.role,
    );

    if (!canApprove) {
      throw new Error("Not authorized to approve this request");
    }

    // When approving: require attachment if the leave type requires a document
    if (input.action === "APPROVED") {
      const leave = await this.leaveRepo.getLeaveRequestById(requestId);
      if (leave?.leave_type_key) {
        const leaveTypes = await getLeaveTypesWithRules();
        const rawRule = leaveTypes.find((t) => t.type_key === leave.leave_type_key);
        const rule = mergeRule(rawRule);
        if (rule.requires_document) {
          const attachments = await this.leaveRepo.getAttachments(requestId);
          if (!attachments?.length) {
            throw new Error(
              "An attachment is required for this leave type. The employee must upload a document from their leave request details before approval.",
            );
          }
        }
      }
    }

    await this.repo.updateApprovalStep(requestId, step.step_order, input);

    if (input.action === "REJECTED") {
      await this.leaveRepo.updateLeaveRequestStatus(requestId, "REJECTED");
      return;
    }

    const hasMoreSteps = await this.repo.hasPendingSteps(requestId);

    if (!hasMoreSteps) {
      await this.leaveEngine.finalizeApprovedLeave(requestId);
    }
  }
}
