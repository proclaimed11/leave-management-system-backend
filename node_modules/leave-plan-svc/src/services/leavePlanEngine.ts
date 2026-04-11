import { LeavePlanRepository } from "../repositories/leavePlanRepository";
import {
  CreateLeavePlanInput,
  UpdateLeavePlanInput,
  LeavePlanResponse,
  PaginatedLeavePlansResponse,
  ManagerPlannedLeavesResponse,
  LeavePlanStatus,
} from "../types/types";
import { JwtUser } from "../types/types";
import {
  assertDatesValid,
  calcDaysInclusive,
} from "../validators/dateValidator";
import { CONFIG } from "../config";
import { getSubordinates } from "./directoryService";
import { createDraft } from "../services/leaveRequestService";
export class LeavePlanEngine {
  constructor(private repo = new LeavePlanRepository()) {}

  async createPlan(
    me: JwtUser,
    input: CreateLeavePlanInput,
  ): Promise<LeavePlanResponse> {
    if (!me?.employee_number) {
      throw new Error("employee_number missing in token");
    }

    const { leave_type_key, start_date, end_date, reason } = input;

    if (!leave_type_key) throw new Error("leave_type_key is required");
    if (!start_date || !end_date)
      throw new Error("start_date and end_date are required");

    assertDatesValid(start_date, end_date);

    const days = calcDaysInclusive(start_date, end_date);

    const today = new Date().toISOString().split("T")[0];
    if (start_date <= today) {
      throw new Error(
        "Leave plans must start in the future. Use Apply Leave instead.",
      );
    }

    const hasOverlap = await this.repo.hasOverlap(
      me.employee_number,
      start_date,
      end_date,
    );
    if (hasOverlap) {
      throw new Error("Overlapping leave plan exists");
    }

    const plan = await this.repo.create(me.employee_number, {
      leave_type_key,
      start_date,
      end_date,
      total_days: days,
      reason: reason ?? null,
    });

    return {
      id: plan.id,
      status: plan.status,
      leave_type_key: plan.leave_type_key,
      start_date: plan.start_date,
      end_date: plan.end_date,
      total_days: plan.total_days,
      reason: plan.reason,
      created_at: plan.created_at,
    };
  }

  async listMyPlans(
    me: JwtUser,
    options: {
      page?: number;
      limit?: number;
      status?: "PLANNED" | "CANCELLED" | "CONVERTED";
      year?: number;
    },
  ): Promise<PaginatedLeavePlansResponse> {
    if (!me?.employee_number) {
      throw new Error("employee_number missing in token");
    }

    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const offset = (page - 1) * limit;

    const { rows, total } = await this.repo.listByEmployee(me.employee_number, {
      status: options.status,
      year: options.year,
      offset,
      limit,
    });

    return {
      page,
      limit,
      count: rows.length,
      total,
      total_pages: Math.ceil(total / limit),
      data: rows.map((p) => ({
        id: p.id,
        leave_type_key: p.leave_type_key,
        start_date: p.start_date,
        end_date: p.end_date,
        total_days: p.total_days,
        status: p.status,
        reason: p.reason,
        created_at: p.created_at,
      })),
    };
  }

  async updatePlan(
    me: JwtUser,
    planId: number,
    input: UpdateLeavePlanInput,
  ): Promise<LeavePlanResponse> {
    if (!me?.employee_number) {
      throw new Error("employee_number missing in token");
    }

    const existing = await this.repo.findById(planId);
    if (!existing) {
      throw new Error("Leave plan not found");
    }

    if (existing.employee_number !== me.employee_number) {
      throw new Error("Not allowed to update this plan");
    }

    if (existing.status !== "PLANNED") {
      throw new Error("Only PLANNED leave plans can be edited");
    }

    const startDate = input.start_date ?? existing.start_date;
    const endDate = input.end_date ?? existing.end_date;

    assertDatesValid(startDate, endDate);

    const today = new Date().toISOString().split("T")[0];
    if (startDate <= today) {
      throw new Error("Updated leave plan must start in the future");
    }

    const totalDays = calcDaysInclusive(startDate, endDate);

    const updated = await this.repo.update(planId, me.employee_number, {
      start_date: startDate,
      end_date: endDate,
      reason: input.reason ?? existing.reason,
      total_days: totalDays,
    });

    if (!updated) {
      throw new Error("Failed to update leave plan");
    }

    return {
      id: updated.id,
      leave_type_key: updated.leave_type_key,
      start_date: updated.start_date,
      end_date: updated.end_date,
      total_days: updated.total_days,
      status: updated.status,
      reason: updated.reason,
      created_at: updated.created_at,
    };
  }

  async cancelPlan(me: JwtUser, planId: number): Promise<{ message: string }> {
    if (!me?.employee_number) {
      throw new Error("employee_number missing in token");
    }

    const cancelled = await this.repo.cancel(planId, me.employee_number);

    if (!cancelled) {
      throw new Error("Leave plan not found or already processed");
    }

    return { message: "Leave plan cancelled successfully" };
  }

  async convertPlan(
    me: JwtUser,
    planId: number,
  ): Promise<{
    message: string;
    redirect: {
      path: string;
    };
  }> {
    if (!me?.employee_number) {
      throw new Error("employee_number missing in token");
    }

    const plan = await this.repo.findById(planId);
    if (!plan) throw new Error("Leave plan not found");

    if (plan.employee_number !== me.employee_number) {
      throw new Error("Not allowed to convert this plan");
    }

    if (plan.status !== "PLANNED") {
      throw new Error("Only PLANNED leave plans can be converted");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(plan.start_date);
    startDate.setHours(0, 0, 0, 0);

    if (startDate <= today) {
      throw new Error(
        "Cannot convert a leave plan that starts today or in the past",
      );
    }

    const diffDays = Math.ceil(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays > CONFIG.LEAVE_PLAN_CONVERSION_WINDOW_DAYS) {
      throw new Error(
        `Leave plan can only be converted within ${CONFIG.LEAVE_PLAN_CONVERSION_WINDOW_DAYS} days of start date`,
      );
    }

    const draft = await createDraft({
      employee_number: plan.employee_number,
      leave_type_key: plan.leave_type_key,
      start_date: plan.start_date,
      end_date: plan.end_date,
      reason: plan.reason,
      source_plan_id: plan.id,
    });
    await this.repo.withTx(async (c) => {
      await this.repo.markConverted(c, planId, draft.id);
    });

    return {
      message: "Leave plan converted to draft leave request",
      redirect: {
        path: `/leave-request/${draft.id}/edit`,
      },
    };
  }

  async getManagerPlannedLeaves(
    managerEmpNo: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      statuses?: LeavePlanStatus[];
    },
  ): Promise<ManagerPlannedLeavesResponse> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const statuses: LeavePlanStatus[] =
      options.statuses && options.statuses.length
        ? options.statuses
        : ["PLANNED", "CONVERTED"];

    const subs = await getSubordinates(managerEmpNo);

    if (!subs.length) {
      return {
        page,
        limit,
        count: 0,
        total: 0,
        total_pages: 0,
        data: [],
      };
    }

    let filteredSubs = subs;

    if (options.search) {
      const q = options.search.toLowerCase();
      filteredSubs = subs.filter((s) => s.full_name.toLowerCase().includes(q));
    }

    const empNos = filteredSubs.map((s) => s.employee_number);

    if (!empNos.length) {
      return {
        page,
        limit,
        count: 0,
        total: 0,
        total_pages: 0,
        data: [],
      };
    }

    const { rows, total } = await this.repo.listPlansForEmployees(
      empNos,
      statuses,
      offset,
      limit,
    );

    const data = rows.map((r) => {
      const emp = filteredSubs.find(
        (s) => s.employee_number === r.employee_number,
      );

      return {
        id: r.id,
        employee_number: r.employee_number,
        employee_name: emp?.full_name ?? r.employee_number,
        leave_type_key: r.leave_type_key,
        start_date: r.start_date,
        end_date: r.end_date,
        total_days: r.total_days,
        reason: r.reason,
        status: r.status,
        created_at: r.created_at,
      };
    });

    return {
      page,
      limit,
      count: data.length,
      total,
      total_pages: Math.ceil(total / limit),
      data,
    };
  }
}
