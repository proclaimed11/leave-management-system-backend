import { LeaveRepository } from "../repositories/leaveRepository";
import { HandoverRepository } from "../repositories/handoverRepository";
import cloudinary from "../utils/cloudinary";

import {
  JwtUser,
  ApplyPayload,
  LeaveRequestRow,
  UploadInput,
  MyLeaveRequestQuery,
  PaginatedResult,
  DirectoryProfile,
  EmployeeRole,
} from "../types/types";

import {
  assertEmployeeExists,
  getEmployeeProfile,
  getSubordinates,
} from "./directoryService";

import { getHolidaysBetween, getLeaveTypesWithRules } from "./policyService";
import { getEntitlements, deductEntitlement } from "./entitlementService";
import { ApprovalEngine } from "./approvalWorkflowEngine";
import { ApprovalRepository } from "../repositories/approvalRepository";

import {
  assertDatesValid,
  calcDaysInclusive,
  mergeRule,
  validateGenderRestriction,
} from "../validators/leaveValidator";
import { mapDirectoryRoleToEmployeeRole } from "../types/roleMapper";
import { countLeaveDays } from "../utils/leaveDays";

export class LeaveEngine {
  constructor(private repo = new LeaveRepository()) {}
  private handoverRepo = new HandoverRepository();
  private approvalRepo = new ApprovalRepository();

  private approvalEngine = new ApprovalEngine(this.approvalRepo, {
    getEmployeeByNumber: async (employee_number: string) => {
      const p: DirectoryProfile | null = await getEmployeeProfile({
        employee_number,
      });

      if (!p) return null;

      return {
        employee_number: p.employee_number,
        role: mapDirectoryRoleToEmployeeRole(p.directory_role),
        reports_to: p.manager_employee_number ?? null,
        department_id: p.department_id ?? null,
      };
    },

    updateRequestStatus: async (request_id, status) => {
      await this.repo.updateLeaveRequestStatus(request_id, status);
    },
  });
  async apply(
    authHeader: string | undefined,
    me: JwtUser,
    payload: ApplyPayload,
  ) {
    const prepared = await this.validateAndPrepareLeave(
      authHeader,
      me,
      payload,
    );
    const created = await this.repo.withTx(async (c) => {
      const leave = await this.repo.createLeave(c, {
        employee_number: me.employee_number,
        company_key: prepared.company_key!,
        leave_type_key: payload.leave_type_key,
        start_date: payload.start_date,
        end_date: payload.end_date,
        total_days: prepared.daysRequested,
        reason: payload.reason ?? null,
        status: "PENDING",
        handover_notes: payload.handover_notes ?? null,
        handover_to: payload.handover_to,
      });

      await this.approvalRepo.insertWorkflowSteps(
        leave.id,
        prepared.workflowSteps,
        c,
      );

      const handover = await this.handoverRepo.createHandover(
        leave.id,
        payload.handover_to,
        payload.handover_notes ?? null,
        null,
        c,
      );

      if (Array.isArray(payload.handover_tasks)) {
        for (const t of payload.handover_tasks) {
          await this.handoverRepo.createTask(handover.id, t, c);
        }
      }

      return leave;
    });

    return {
      message: "Leave request submitted",
      request_id: created.id,
      days_requested: prepared.daysRequested,
      next_approver: prepared.nextApprover,
    };
  }
  async submitDraft(
    authHeader: string | undefined,
    me: JwtUser,
    requestId: number,
    body: {
      handover_to: string;
      handover_notes?: string;
      handover_tasks?: any[];
    },
  ) {
    const draft = await this.repo.getLeaveRequestById(requestId);

    if (!draft) throw new Error("Leave request not found");
    if (draft.status !== "DRAFT") {
      throw new Error("Only draft leave requests can be submitted");
    }
    if (draft.employee_number !== me.employee_number) {
      throw new Error("Not allowed to submit this leave request");
    }

    const prepared = await this.validateAndPrepareLeave(
      authHeader,
      me,
      {
        leave_type_key: draft.leave_type_key,
        start_date: draft.start_date,
        end_date: draft.end_date,
        reason: draft.reason,
        handover_to: body.handover_to,
        handover_notes: body.handover_notes,
        handover_tasks: body.handover_tasks,
      },
      { excludeRequestId: requestId },
    );

    await this.repo.withTx(async (c) => {
      await this.repo.promoteDraftToPending(c, requestId, {
        total_days: prepared.daysRequested,
        handover_to: body.handover_to,
        handover_notes: body.handover_notes,
      });

      await this.approvalRepo.insertWorkflowSteps(
        requestId,
        prepared.workflowSteps,
        c,
      );

      const handover = await this.handoverRepo.createHandover(
        requestId,
        body.handover_to,
        body.handover_notes ?? null,
        null,
        c,
      );

      if (Array.isArray(body.handover_tasks)) {
        for (const t of body.handover_tasks) {
          await this.handoverRepo.createTask(handover.id, t, c);
        }
      }
    });

    return {
      message: "Leave request submitted",
      request_id: requestId,
      next_approver: prepared.nextApprover,
    };
  }

  private async validateAndPrepareLeave(
    authHeader: string | undefined,
    me: JwtUser,
    payload: ApplyPayload,
    options?: {
      excludeRequestId?: number;
    },
  ): Promise<{
    company_key: string | null;
    daysRequested: number;
    workflowSteps: any[];
    nextApprover: {
      role: EmployeeRole;
      employee_number: string | null;
    } | null;
  }> {
    const { leave_type_key, start_date, end_date, handover_to } = payload;

    if (!leave_type_key) throw new Error("leave_type_key is required");
    if (!start_date || !end_date) {
      throw new Error("start_date and end_date are required");
    }
    if (!handover_to) throw new Error("handover_to is required");
    if (handover_to === me.employee_number) {
      throw new Error("handover_to cannot be yourself");
    }

    assertDatesValid(start_date, end_date);

    await Promise.all([
      assertEmployeeExists(me.employee_number),
      assertEmployeeExists(handover_to),
    ]);

    const profile = await getEmployeeProfile({
      employee_number: me.employee_number,
    });
    // Fetch holidays from Leave Policy Service
    const holidays = await getHolidaysBetween({
      start: start_date,
      end: end_date,
      company_key: profile.company_key,
      location: profile.location ?? null,
    });

    // Convert to Set for fast lookup
    const holidaySet = new Set(holidays.map((h) => h.holiday_date));

    // Calculate leave days (exclude Sundays + holidays)
    const daysRequested = countLeaveDays({
      start: start_date,
      end: end_date,
      holidayDates: holidaySet,
    });

    const leaveTypes = await getLeaveTypesWithRules();
    const ruleByKey = new Map(leaveTypes.map((t) => [t.type_key, t]));
    const rawRule = ruleByKey.get(leave_type_key);

    if (!rawRule) {
      throw new Error(`Leave type ${leave_type_key} does not exist`);
    }

    const rule = mergeRule(rawRule);

    validateGenderRestriction(rule, profile);

    const hasOverlap = options?.excludeRequestId
      ? await this.repo.findOverlapExcluding(
          me.employee_number,
          start_date,
          end_date,
          options.excludeRequestId,
        )
      : await this.repo.findOverlap(me.employee_number, start_date, end_date);

    if (hasOverlap) {
      throw new Error("Overlapping leave request exists");
    }

    const entitlements = await getEntitlements(me.employee_number);
    const entitlement = entitlements.find(
      (e) => e.leave_type_key === leave_type_key,
    );

    if (!entitlement) {
      throw new Error(`No entitlement found for ${leave_type_key}`);
    }

    if (Number(entitlement.remaining_days) < daysRequested) {
      throw new Error(
        `Insufficient balance. Remaining: ${entitlement.remaining_days}, requested: ${daysRequested}`,
      );
    }

    const workflowResult = await this.approvalEngine.buildWorkflow({
      requester: {
        employee_number: profile.employee_number,
        role: mapDirectoryRoleToEmployeeRole(profile.directory_role),
        reports_to: profile.manager_employee_number ?? null,
        department_id: profile.department_id ?? null,
      },
      leave_type_key,
      days_requested: daysRequested,
    });

    const firstStep = workflowResult.steps[0] ?? null;

    return {
      company_key: profile?.company_key ?? null,
      daysRequested,
      workflowSteps: workflowResult.steps,
      nextApprover: firstStep
        ? {
            role: firstStep.role,
            employee_number: firstStep.approver_emp_no,
          }
        : null,
    };
  }

  async uploadAttachment(input: UploadInput) {
    const { request_id, fileBuffer, fileName } = input;

    const exists = await this.repo.leaveRequestExists(request_id);
    if (!exists) throw new Error("Leave request not found");

    const uploaded = await this.uploadToCloudinary(
      fileBuffer,
      request_id,
      fileName,
    );

    const saved = await this.repo.create({
      request_id,
      file_url: uploaded.secure_url,
    });

    return {
      message: "Attachment uploaded",
      attachment: saved,
    };
  }

  async listAttachments(request_id: number) {
    const rows = await this.repo.listByRequest(request_id);
    return {
      request_id,
      count: rows.length,
      attachments: rows,
    };
  }

  private uploadToCloudinary(
    buffer: Buffer,
    requestId: number,
    fileName: string,
  ) {
    return new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "leave-attachments",
          resource_type: "auto",
          public_id: `leave_${requestId}_${Date.now()}`,
          use_filename: true,
          filename_override: fileName,
        },
        (err, result) => {
          if (err || !result) return reject(err || new Error("Upload failed"));
          resolve({ secure_url: result.secure_url });
        },
      );

      stream.end(buffer);
    });
  }

  async getMyRequests(
    me: JwtUser,
    query: MyLeaveRequestQuery,
  ): Promise<PaginatedResult<LeaveRequestRow>> {
    const { page, limit, status, search } = query;

    const offset = (page - 1) * limit;

    return await this.repo.findMinePaginated({
      employee_number: me.employee_number,
      limit,
      offset,
      status,
      search,
    });
  }
  async getLeaveRequestDetails(
    requestId: number,
    viewer: { employee_number: string; role: EmployeeRole },
  ) {
    const leave = await this.repo.getLeaveRequestById(requestId);
    if (!leave) throw new Error("Leave request not found");

    if (leave.employee_number === viewer.employee_number) {
      return this.buildLeaveDetails(leave, requestId);
    }

    const approvals = await this.repo.getApprovalTrail(requestId);

    const isDirectApprover = approvals.some(
      (a) => a.approver_emp_no === viewer.employee_number,
    );

    const isRoleApprover = approvals.some(
      (a) => a.approver_emp_no === null && a.role === viewer.role,
    );

    if (!isDirectApprover && !isRoleApprover) {
      throw new Error("You are not authorized to view this leave request");
    }
    return this.buildLeaveDetails(leave, requestId);
  }

  private async buildLeaveDetails(leave: LeaveRequestRow, requestId: number) {
    const [requesterProfile, approvalTrail, attachments, handover] =
      await Promise.all([
        getEmployeeProfile({ employee_number: leave.employee_number }),
        this.repo.getApprovalTrail(requestId),
        this.repo.getAttachments(requestId),
        this.handoverRepo.getHandoverByRequest(requestId),
      ]);

    let handoverTasks: any[] = [];
    if (handover) {
      handoverTasks = await this.handoverRepo.getTasks(handover.id);
    }

    return {
      leave: {
        id: leave.id,
        leave_type_key: leave.leave_type_key,
        start_date: leave.start_date,
        end_date: leave.end_date,
        total_days: leave.total_days,
        reason: leave.reason,
        status: leave.status,
        created_at: leave.created_at,
      },
      requester: {
        employee_number: requesterProfile.employee_number,
        full_name: requesterProfile.full_name,
        email: requesterProfile.email,
        department: requesterProfile.department,
        title: requesterProfile.title,
      },
      approvals: approvalTrail,
      attachments,
      handover: handover
        ? {
            assigned_to: handover.handover_to,
            notes: handover.notes,
            document_url: handover.document_url,
            tasks: handoverTasks,
          }
        : null,
    };
  }

  async finalizeApprovedLeave(requestId: number): Promise<void> {
    const leave = await this.repo.updateLeaveRequestStatus(
      requestId,
      "APPROVED",
    );

    if (!leave) throw new Error("Leave not found");
    await deductEntitlement({
      employee_number: leave.employee_number,
      leave_type_key: leave.leave_type_key,
      days: Number(leave.total_days),
      reason: "Leave approved",
      source_request_id: leave.id,
    });
  }
}

export const engine = new LeaveEngine();
