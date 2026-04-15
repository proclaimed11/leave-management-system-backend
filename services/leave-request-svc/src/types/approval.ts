
export type EmployeeRole =
  | "employee"
  | "supervisor"
  | "hod"
  | "hr"
  | "management"
  | "admin"
  | "consultant";

export type ApprovalAction = "PENDING" | "APPROVED" | "REJECTED";


export interface ApprovalStep {
  request_id: number;
  step_order: number;
  role: EmployeeRole;
  approver_emp_no: string | null;
  action: ApprovalAction;
  remarks: string | null;
  acted_at: Date | null;
  created_at: Date;
}


export interface ApprovalEmployee {
  employee_number: string;
  role: EmployeeRole;
  reports_to: string | null;
  department_id: number | null;
  /** Used to resolve departmental HOD when none appears in the reporting chain. */
  company_key?: string | null;
  department?: string | null;
}


export interface ApprovalChainInput {
  requester: ApprovalEmployee;
  leave_type_key: string; 
  days_requested: number;
}

export interface ApprovalPolicyRules {
  direct_manager_max_days: number;

  mid_max_days: number;

  hr_only_leave_types?: string[];

  enforce_hr_final?: boolean;

  management_threshold_days?: number;
}


export interface BuiltWorkflowStep {
  step_order: number;
  role: EmployeeRole;
  approver_emp_no: string | null;
}


export interface BuildWorkflowResult {
  steps: BuiltWorkflowStep[];
  meta: {
    used_reporting_chain_length: number;
    used_policy:
      | "DIRECT_MANAGER"
      | "MID"
      | "FULL"
      | "HR_ONLY"
      | "MANAGER_THEN_HR"
      | "HR_THEN_MANAGER"
      | "PARALLEL_HR_AND_HOD";
  };
}

export interface ApprovalActor {
  employee_number: string;
  role: EmployeeRole;
}

export interface ActOnApprovalInput {
  request_id: number;
  actor: ApprovalActor;
  action: Exclude<ApprovalAction, "PENDING">; 
  remarks?: string;
}
export interface ApprovalHistoryRow {
  approval_id: number;
  request_id: number;

  step_order: number;
  role: EmployeeRole;
  approver_emp_no: string | null;

  action: "PENDING" | "APPROVED" | "REJECTED";
  remarks: string | null;
  acted_at: string | null;

  requester_emp_no: string;
  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  applied_at: string;
}

export interface PaginatedApprovals<T> {
  total: number;
  items: T[];
}