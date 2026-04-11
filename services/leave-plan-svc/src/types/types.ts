
export interface JwtUser {
  user_id: number;
  employee_number: string;
  email: string;
  role: string;
}
export type Gender = "M" | "F" | "U" | null;

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
}

export type LeavePlanStatus =
  | "PLANNED"
  | "CANCELLED"
  | "CONVERTED";



export interface LeavePlanRow {
  id: number;
  employee_number: string;
  leave_type_key: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  total_days: number;
  reason: string | null;
  status: LeavePlanStatus;
  converted_leave_request_id: number | null;
  created_at: string;
  updated_at: string;
}



export interface CreateLeavePlanInput {
  leave_type_key: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  reason?: string;
}

export interface CreateLeavePlanResponse {
  message: string;
  plan_id: number;
  status: LeavePlanStatus;
}



export interface ListMyLeavePlansQuery {
  status?: LeavePlanStatus;
  year?: number;
  page?: number;
  limit?: number;
}

export interface MyLeavePlanCard {
  id: number;
  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: LeavePlanStatus;
  converted_leave_request_id: number | null;
  created_at: string;
}

export interface PaginatedLeavePlans {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  data: MyLeavePlanCard[];
}


export interface UpdateLeavePlanInput {
  start_date?: string;
  end_date?: string;
  reason?: string;
}

export interface UpdateLeavePlanResponse {
  message: string;
  plan_id: number;
}



export interface CancelLeavePlanResponse {
  message: string;
  plan_id: number;
  status: "CANCELLED";
}



export interface ConvertLeavePlanInput {
  reason?: string; // optional override
}

export interface ConvertLeavePlanResponse {
  message: string;
  plan_id: number;
  leave_request_id: number;
}



export interface ConvertLeavePlanContext {
  plan_id: number;
  employee_number: string;
}



export interface LeavePlanResponse {
  id: number;
  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: LeavePlanStatus;
  reason: string | null;
  created_at: string;
}


export interface PaginatedLeavePlansResponse {
  page: number;
  limit: number;
  count: number;
  total: number;
  total_pages: number;
  data: LeavePlanResponse[];
}
export interface ManagerPlannedLeaveRow {
  id: number;
  employee_number: string;
  employee_name: string;
  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  created_at: string;
}

export interface ManagerPlannedLeavesResponse {
  page: number;
  limit: number;
  count: number;
  total: number;
  total_pages: number;
  data: ManagerPlannedLeaveRow[];
}

