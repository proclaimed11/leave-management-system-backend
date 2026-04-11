export type LeaveRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface LeaveRequestRow {
  id: number;
  employee_number: string;
  leave_type_key: string;
  start_date: string; // ISO from DB
  end_date: string; // ISO from DB
  days_requested: number;
  status: LeaveRequestStatus;
  created_at: string;
}

export interface EntitlementRow {
  employee_number: string;
  leave_type_key: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

/** Leave balance for one type, returned in dashboard/me for profile display. */
export interface LeaveBalanceItem {
  leave_type_key: string;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

export interface EmployeeDashboardResponse {
  employee_number: string;
  year: number;

  cards: {
    annual_remaining_days: number;
    comp_off_earned: number;
    pending_requests: number;
    approved_this_year: number;
  };

  /** All leave types with balance (for profile Leave Balance card). */
  leave_types: LeaveBalanceItem[];

  latest_requests: Array<{
    id: number;
    leave_type_key: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: LeaveRequestStatus;
    created_at: string;
  }>;
}

export interface ManagerDashboardSummary {
  team_size: number;
  pending_approvals: number;
  on_leave_today: number;
  team_utilization_percent: number;
}

export interface PendingApprovalCard {
  request_id: number;

  requester: {
    employee_number: string;
    full_name: string;
  };

  leave: {
    type_key: string;
    type_name: string;
    start_date: string;
    end_date: string;
    total_days: number;
  };

  reason: string | null;
  applied_at: string;
}

export interface ManagerDashboardResponse {
  summary: ManagerDashboardSummary;
  pending_requests: PendingApprovalCard[];
}
export interface ManagerDashboardSummary {
  team_size: number;
  pending_approvals: number;
  on_leave_today: number;
  team_utilization_percent: number;
}

export interface PendingApprovalCard {
  request_id: number;

  requester: {
    employee_number: string;
    full_name: string;
  };

  leave: {
    type_key: string;
    type_name: string;
    start_date: string;
    end_date: string;
    total_days: number;
  };

  reason: string | null;
  applied_at: string;
}

export interface ManagerDashboardResponse {
  summary: ManagerDashboardSummary;
  pending_requests: PendingApprovalCard[];
}
export interface PendingApprovalCardRow {
  approval_id: number;
  request_id: number;

  step_order: number;
  approver_role: string; // supervisor/hod/management/hr
  approver_emp_no: string | null;

  requester_emp_no: string;

  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;

  reason: string | null;
  applied_at: string;
}
export interface TeamLeaveRow {
  request_id: number;
  employee_number: string;

  employee: {
    full_name: string;
    department: string | null;
  };

  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;

  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
}
export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  count: number;
  total: number;
  total_pages: number;
  data: T[];
}
export interface HrDashboardSummary {
  total_employees: number;
  active_requests: number;
  leave_liability: number;
  open_disputes: number;
}

export interface LeaveTypeDistribution {
  leave_type_key: string;
  percentage: number;
}

export interface DepartmentOverviewRow {
  department: string;
  on_leave: number;
  total: number;
  utilization_percent: number;
}

export interface HrFinalApprovalCard {
  request_id: number;
  requester: {
    employee_number: string;
    full_name: string;
    department: string | null;
  };
  leave: {
    leave_type_key: string;
    start_date: string;
    end_date: string;
    total_days: number;
  };
  approved_by_supervisor: string | null;
  applied_at: string;
}

export interface HrDashboardResponse {
  summary: HrDashboardSummary;
  leave_type_distribution: LeaveTypeDistribution[];
  department_overview: DepartmentOverviewRow[];
  final_approval_queue: HrFinalApprovalCard[];
}
