export type Gender = "M" | "F" | "U" | null;

export interface JwtUser {
  user_id: number;
  employee_number: string;
  email: string;
  role: string;
}

export interface LeaveRule {
  entitlement_days: number | null;
  max_consecutive_days: number | null;
  max_per_year: number | null;
  requires_approval: boolean;
  approval_levels: number;
  paid: boolean;
  deduct_from_balance: boolean;
  requires_document: boolean;
  attachment_required_after_days: number | null;
  allow_weekends: boolean;
  allow_public_holidays: boolean;
  min_service_months: number;
  gender_restriction: "any" | "male" | "female";
  notice_days_required: number;
}
export interface LeaveRuleRow {
  type_key: string;
  entitlement_days: number | null;
  max_consecutive_days: number | null;
  max_per_year: number | null;
  requires_approval: boolean;
  approval_levels: number;
  paid: boolean;
  deduct_from_balance: boolean;
  requires_document: boolean;
  attachment_required_after_days: number | null;
  allow_weekends: boolean;
  allow_public_holidays: boolean;
  min_service_months: number;
  gender_restriction: "any" | "male" | "female";
  notice_days_required: number;
}
export interface LeaveType {
  id: number;
  type_key: string;
  name: string;
  description?: string | null;
  default_days?: number | null;
  is_active?: boolean | null;
}

export interface PolicyFull {
  leave_types: LeaveType[];
  leave_rules: (LeaveRule & { type_key: string })[];
  comp_off_rules: any | null;
}
export interface HandoverCandidate {
  employee_number: string;
  full_name: string;
}
export interface DirectoryProfile {
  employee_number: string;
  full_name: string;
  email: string;
  department?: string | null;
  title?: string | null;
  status?: string | null; // active, terminated, etc.
  manager_employee_number?: string | null;
  gender?: Gender;
  date_of_joining?: string | null; // YYYY-MM-DD
  directory_role: string;
  department_id: number | null;
  company_key: string;
  location?: string | null;

}
export interface MyLeaveRequestQuery {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}
export interface FindMineParams {
  employee_number: string;
  limit: number;
  offset: number;
  status?: string;
  search?: string;
}
export interface PaginatedResult<T> {
  total: number;
  requests: T[];
}
export interface EntitlementRow {
  employee_number: string;
  leave_type_key: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

export interface ApplyPayload {
  leave_type_key: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
  handover_to: string;
  handover_notes?: string | null;
  attachment_id?: number | null;
  handover_tasks?: {
    title: string;
    order_index?: number;
  }[];
}

export interface SubordinateItem {
  employee_number: string;
  full_name: string;
  email: string;
  department?: string | null;
  title?: string | null;
  status?: string | null;
}

export interface LeaveRequestRow {
  id: number;
  employee_number: string;
  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: string;
  deducted_from_balance: boolean;
  handover_notes: string | null;
  handover_document?: string | null;
  handover_to: string | null;
  created_at: string;
  updated_at: string;
}
export type UploadInput = {
  request_id: number;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
};

export interface LeaveBasicRow {
  id: number;
  employee_number: string;
  status: string;
  start_date: string;
  end_date: string;
  leave_type_key: string;
  total_days: number;


}

export interface LeaveApprovalRow {
  request_id: number;
  approver_emp_no: string | null;
  role: "manager" | "hr";
  action: "PENDING" | "APPROVED" | "REJECTED";
  remarks: string | null;
  created_at: string;
}
// -------------------------
// Approval Types
// -------------------------

export interface LeaveRequestWithProfile extends LeaveRequestRow {
  employee_profile: DirectoryProfile;
}

export type EmployeeRole = 
  | 'employee'
  | 'supervisor'
  | 'hod'
  | 'hr'
  | 'management'
  | 'admin'
  | 'consultant';

export type ApprovalAction = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WorkflowStep {
  step_order: number;
  role: EmployeeRole;
  approver_emp_no: string | null;
  action: ApprovalAction;
}

export interface LeaveApproval {
  id: number;
  request_id: number;
  step_order: number;
  approver_emp_no: string | null;
  role: EmployeeRole;
  action: ApprovalAction;
  remarks: string | null;
  acted_at: Date | null;
  created_at: Date;

}
export interface PendingApprovalRow {
  approval_id: number;
  request_id: number;

  step_order: number;
  role: EmployeeRole;
  approver_emp_no: string | null;

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
export interface CreateWorkflowStepInput {
  request_id: number;
  step_order: number;
  role: EmployeeRole;
  approver_emp_no: string | null;
  action: ApprovalAction;
}

export interface UpdateApprovalInput {
  action: ApprovalAction;
  approver_emp_no: string;
  remarks?: string;
}

// -------------------------
// Handover Types
// -------------------------

export interface HandoverRecord {
  id: number;
  request_id: number;
  handover_to: string | null;
  notes: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandoverTask {
  id: number;
  handover_id: number;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  updated_by: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  order_index?: number;
}

export interface UpdateTaskStatusPayload {
  is_completed: boolean;
  updated_by: string;
}

export interface HandoverRow {
  id: number;
  request_id: number;
  handover_to: string;
  notes: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandoverTaskRow {
  id: number;
  handover_id: number;
  title: string;
  is_completed: boolean;
  order_index: number;
  completed_at: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}
export interface CompleteTaskResult {
  task_id: number;
  handover_id: number;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
}
export interface HandoverQuery {
  employee_number: string;
  status?: string;
  page: number;
  limit: number;
}

export interface HandoverCard {
  handover_id: number;
  request_id: number;

  assigned_by: {
    employee_number: string;
    full_name: string;
    department: string;
  };

  leave_type_name: string;
  start_date: string;
  end_date: string;

  leave_status: "PENDING" | "APPROVED" | "REJECTED";

  tasks_assigned: number;

  created_at: string;
}
export interface HandoverDetail {
  handover_id: number;
  request_id: number;

  leave_type_key: string;
  start_date: string;
  end_date: string;
  leave_status: string;

  assigned_by_employee_number: string;

  handover_notes: string | null;
  document_url: string | null;

  tasks: {
    id: number;
    title: string;
    is_completed: boolean;
    completed_at: string | null;
    updated_by: string | null;
    order_index: number;
  }[];

  created_at: string;
}
