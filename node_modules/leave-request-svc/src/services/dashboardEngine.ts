import axios from "axios";
import { DashboardRepository } from "../repositories/dashboardRepository";
import {
  DepartmentOverviewRow,
  EmployeeDashboardResponse,
  EntitlementRow,
  HrDashboardResponse,
  HrFinalApprovalCard,
  LeaveTypeDistribution,
  ManagerDashboardResponse,
  PaginatedResponse,
  PendingApprovalCard,
  PendingApprovalCardRow,
  TeamLeaveRow,
} from "../types/dashboard";
import { getEntitlements } from "./entitlementService";
import {
  getDepartmentSummary,
  getEmployeeProfile,
  getEmployeesByNumbers,
  getSubordinates,
  listActiveEmployees,
  listActiveEmployeesCount,
} from "./directoryService";
import { getLeaveTypesWithRules } from "./policyService";
import { DirectoryProfile } from "../types/types";
type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class DashboardEngine {
  constructor(
    private repo = new DashboardRepository(),
    private http = axios,
  ) {}

  private currentYear = new Date().getFullYear();
  private cache = new Map<string, CacheEntry<any>>();

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  private setCache<T>(key: string, value: T, ttlMs: number) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  private pickRemaining(
    entitlements: EntitlementRow[],
    typeKey: string,
  ): number {
    const e = entitlements.find((x) => x.leave_type_key === typeKey);
    return e ? Number(e.remaining_days) : 0;
  }

  async getMyDashboard(
    employeeNumber: string,
  ): Promise<EmployeeDashboardResponse> {
    if (!employeeNumber) throw new Error("employee_number is required");
    const cacheKey = `employee_dashboard:${employeeNumber}`;
    const cached = this.getFromCache<EmployeeDashboardResponse>(cacheKey);
    if (cached) return cached;

    const entitlements = await getEntitlements(employeeNumber);

    const annualRemaining = this.pickRemaining(entitlements, "ANNUAL");
    const compOffRemaining = this.pickRemaining(entitlements, "COMP_OFF");

    const [pending, approvedThisYear, latest] = await Promise.all([
      this.repo.countPending(employeeNumber),
      this.repo.countApprovedThisYear(employeeNumber, this.currentYear),
      this.repo.listLatestRequests(employeeNumber, 5),
    ]);

    const leave_types = entitlements.map((e) => ({
      leave_type_key: e.leave_type_key,
      total_days: Number(e.total_days),
      used_days: Number(e.used_days),
      remaining_days: Number(e.remaining_days),
    }));

    const response: EmployeeDashboardResponse = {
      employee_number: employeeNumber,
      year: this.currentYear,
      cards: {
        annual_remaining_days: annualRemaining,
        comp_off_earned: compOffRemaining,
        pending_requests: pending,
        approved_this_year: approvedThisYear,
      },
      leave_types,
      latest_requests: latest.map((r) => ({
        id: r.id,
        leave_type_key: r.leave_type_key,
        start_date: r.start_date,
        end_date: r.end_date,
        days_requested: Number(r.days_requested),
        status: r.status,
        created_at: r.created_at,
      })),
    };
    this.setCache(cacheKey, response, 60_000);

    return response;
  }
  async getManagerDashboard(
    managerEmpNo: string,
  ): Promise<ManagerDashboardResponse> {
    if (!managerEmpNo) throw new Error("manager employee number is required");
    const cacheKey = `manager_dashboard:${managerEmpNo}`;
    const cached = this.getFromCache<ManagerDashboardResponse>(cacheKey);
    if (cached) return cached;
    const subordinates = await getSubordinates(managerEmpNo);
    const employeeNumbers = subordinates.map((s) => s.employee_number);

    const [
      pendingApprovalsCount,
      onLeaveToday,
      usedDaysThisMonth,
      pendingApprovalRows,
    ] = await Promise.all([
      this.repo.countPendingApprovalsForApprover(managerEmpNo),
      this.repo.countOnLeaveTodayForEmployees(employeeNumbers),
      this.repo.sumApprovedLeaveDaysThisMonthForEmployees(employeeNumbers),
      this.repo.listPendingApprovalCardsForApprover(managerEmpNo, 5),
    ]);

    const leaveTypes = await getLeaveTypesWithRules();
    const leaveTypeMap = new Map(
      leaveTypes.map((t) => [t.type_key, t.type_key]),
    );
    const employeeMap = await this.loadActiveEmployeesMap();

    const pendingRequests: PendingApprovalCard[] = pendingApprovalRows.map(
      (row) => {
        const emp = employeeMap.get(row.requester_emp_no);

        return {
          request_id: row.request_id,
          requester: {
            employee_number: row.requester_emp_no,
            full_name: emp?.full_name ?? row.requester_emp_no,
          },
          leave: {
            type_key: row.leave_type_key,
            type_name:
              leaveTypeMap.get(row.leave_type_key) ?? row.leave_type_key,
            start_date: row.start_date,
            end_date: row.end_date,
            total_days: row.total_days,
          },
          reason: row.reason,
          applied_at: row.applied_at,
        };
      },
    );

    const workingDaysPerMonth = 22;
    const teamSize = employeeNumbers.length;

    const utilization =
      teamSize === 0
        ? 0
        : Math.round(
            (usedDaysThisMonth / (teamSize * workingDaysPerMonth)) * 100,
          );
    const response: ManagerDashboardResponse = {
      summary: {
        team_size: teamSize,
        pending_approvals: pendingApprovalsCount,
        on_leave_today: onLeaveToday,
        team_utilization_percent: utilization,
      },
      pending_requests: pendingRequests,
    };
    this.setCache(cacheKey, response, 30_000);

    return response;
  }
  async getTeamLeaves(
    managerEmpNo: string,
    options: {
      page?: number;
      limit?: number;
      status?: "PENDING" | "APPROVED" | "UPCOMING" | "REJECTED";
      search?: string;
    },
  ): Promise<PaginatedResponse<TeamLeaveRow>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const offset = (page - 1) * limit;

    let subs = await getSubordinates(managerEmpNo);

    if (options.search) {
      const q = options.search.toLowerCase();
      subs = subs.filter((s) => s.full_name.toLowerCase().includes(q));
    }

    const empNos = subs.map((s) => s.employee_number);

    let dbStatus: string | undefined;
    if (options.status === "PENDING") dbStatus = "PENDING";
    if (options.status === "APPROVED") dbStatus = "APPROVED";
    if (options.status === "REJECTED") dbStatus = "REJECTED";

    const { rows, total } = await this.repo.listTeamLeaves(
      empNos,
      offset,
      limit,
      dbStatus,
    );

    let finalRows = rows;
    if (options.status === "UPCOMING") {
      const today = new Date().toISOString().split("T")[0];
      finalRows = rows.filter(
        (r) => r.status === "APPROVED" && r.start_date > today,
      );
    }

    const data: TeamLeaveRow[] = finalRows.map((r) => {
      const emp = subs.find((s) => s.employee_number === r.employee_number);

      return {
        request_id: r.request_id,
        employee_number: r.employee_number,
        employee: {
          full_name: emp?.full_name ?? r.employee_number,
          department: emp?.department ?? null,
        },
        leave_type_key: r.leave_type_key,
        start_date: r.start_date,
        end_date: r.end_date,
        total_days: Number(r.total_days),
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

  async getHrDashboard(): Promise<HrDashboardResponse> {
    const cacheKey = "hr_dashboard";
    const cached = this.getFromCache<HrDashboardResponse>(cacheKey);
    if (cached) return cached;

    const [
      departmentSummary,
      activeEmployeesCount,
      pendingRequests,
      leaveTypeCounts,
      approvedLeaveNumbers,
      approvalQueue,
    ] = await Promise.all([
      getDepartmentSummary(),
      listActiveEmployeesCount(),
      this.repo.countCompanyPendingRequests(),
      this.repo.getLeaveTypeDistribution(),
      this.repo.getApprovedLeaveEmployeeNumbers().then((nums) => new Set(nums)),
      this.repo.getHrFinalApprovalQueue(5),
    ]);
    const totalApproved = leaveTypeCounts.reduce((s, x) => s + x.count, 0);
    console.log("Total approved leaves (for distribution):", totalApproved);

    const leaveTypeDistribution: LeaveTypeDistribution[] = leaveTypeCounts.map(
      (x) => ({
        leave_type_key: x.leave_type_key,
        percentage:
          totalApproved === 0 ? 0 : Math.round((x.count / totalApproved) * 100),
      }),
    );

    const deptTotals = new Map<string, number>();
    const deptOnLeave = new Map<string, number>();

    departmentSummary.forEach((d) => {
      const key = `${d.company_key}::${d.department}`;

      deptTotals.set(key, d.total);
      deptOnLeave.set(key, 0);
    });

    if (approvedLeaveNumbers.size > 0) {
      const employeesOnLeave = await getEmployeesByNumbers(
        Array.from(approvedLeaveNumbers),
      );
      console.log(
        "Employees currently on leave (for department overview):",
        employeesOnLeave,
      );
      employeesOnLeave.forEach((e) => {
        if (!e.department || !e.company_key) return;

        const key = `${e.company_key}::${e.department}`;

        if (!deptOnLeave.has(key)) return;

        deptOnLeave.set(key, (deptOnLeave.get(key) ?? 0) + 1);
      });
    }
    const departmentOverview: DepartmentOverviewRow[] = Array.from(
      deptTotals.entries(),
    ).map(([key, total]) => {
      const [company_key, department] = key.split("::");
      const onLeave = deptOnLeave.get(key) ?? 0;

      return {
        company_key,
        department,
        total,
        on_leave: onLeave,
        utilization_percent:
          total === 0 ? 0 : Math.round(((total - onLeave) / total) * 100),
      };
    });

    const queueEmployeeNumbers = approvalQueue.map((r) => r.employee_number);

    const queueEmployees =
      queueEmployeeNumbers.length > 0
        ? await getEmployeesByNumbers(queueEmployeeNumbers)
        : [];

    const employeeMap = new Map(
      queueEmployees.map((e) => [e.employee_number, e]),
    );

    const finalApprovalQueue: HrFinalApprovalCard[] = approvalQueue.map((r) => {
      const emp = employeeMap.get(r.employee_number);

      return {
        request_id: r.request_id,
        requester: {
          employee_number: r.employee_number,
          full_name: emp?.full_name ?? r.employee_number,
          department: emp?.department ?? null,
        },
        leave: {
          leave_type_key: r.leave_type_key,
          start_date: r.start_date,
          end_date: r.end_date,
          total_days: Number(r.total_days),
        },
        approved_by_supervisor: r.supervisor_emp_no,
        applied_at: r.created_at,
      };
    });

    const response: HrDashboardResponse = {
      summary: {
        total_employees: activeEmployeesCount,
        active_requests: pendingRequests,
        leave_liability: 0,
        open_disputes: 0,
      },
      leave_type_distribution: leaveTypeDistribution,
      department_overview: departmentOverview,
      final_approval_queue: finalApprovalQueue,
    };

    this.setCache(cacheKey, response, 5 * 60_000);
    return response;
  }

  /** Call after HR (or any) approval action so the dashboard refetch shows updated queue. */
  invalidateHrDashboardCache(): void {
    this.cache.delete("hr_dashboard");
  }

  private async loadActiveEmployeesMap(): Promise<
    Map<string, DirectoryProfile>
  > {
    const cacheKey = "active_employees_map";
    const cached = this.getFromCache<Map<string, DirectoryProfile>>(cacheKey);
    if (cached) return cached;

    const employees = await listActiveEmployees();

    const map = new Map<string, DirectoryProfile>();
    for (const e of employees) {
      map.set(e.employee_number, e);
    }

    this.setCache(cacheKey, map, 5 * 60_000);
    return map;
  }
}

export const dashboardEngineInstance = new DashboardEngine();
