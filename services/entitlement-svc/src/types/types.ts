export interface JwtUser {
  user_id: number;
  employee_number: string;
  email: string;
  role: string;
}

export interface EntitlementRow {
  employee_number: string;
  leave_type_key: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  last_updated?: string;
}

export interface EntitlementHistoryRow {
  employee_number: string;
  leave_type_key: string;
  action: "ADD" | "DEDUCT" | "RESET";
  days_changed: number;
  old_total_days: number;
  new_total_days: number;
  old_remaining: number;
  new_remaining: number;
  reference_id?: string | null;
  reason?: string | null;
  changed_by?: string | null;
  created_at: Date | string;
}

export interface LeaveTypeRow {
  type_key: string;
  name: string;
  description?: string | null;
  default_days?: number | null;
  is_active?: boolean | null;
  entitlement_days?: number | null;
}

export interface DirectoryEmployee {
  employee_number: string;
  full_name: string;
  email: string;
  department?: string | null;
  status?: string | null;
}

export interface DeductInput {
  employee_number: string;
  leave_type_key: string;
  days: number;
  reference_id?: string | null;
  reason?: string | null;
}
export type HRLeaveEvent = {
  date: string;
  action: string;
  reason: string;
  changed_by: string;
  change: string;
  from: number;
  to: number;
};
export type HRLeaveTimeline = {
  leave_type_key: string;
  leave_type: string;
  events: HRLeaveEvent[];
};
export type HRHistoryResponse = {
  employee_number: string;
  timelines: HRLeaveTimeline[];
};

