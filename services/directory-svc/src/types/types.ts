export interface EmployeeCore {
  employee_number: string;
  full_name: string;
  email: string;
  department: string | null;
  title: string | null;
  status: string;
  manager_employee_number: string | null;
  directory_role: string;
}

export interface EmployeePersonal {
  phone?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  marital_status?: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
}

export interface EmployeeFull extends EmployeeCore, EmployeePersonal {}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  department?: string;
  status?: string;
  manager?: string;
  search?: string;
  company_key?: string;
  /** Whitelisted in repository; invalid values fall back to `full_name`. */
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
export interface DepartmentRow {
  id: number;
  dept_key: string;
  name: string;
  status: "active" | "inactive";
  head_employee_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentInput {
  dept_key: string;  // e.g. "ENGINEERING"
  name: string;      // e.g. "Engineering"
  status?: "active" | "inactive";
  head_employee_number?: string | null;
  company_key?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  company_key?: string;
  status?: "active" | "inactive";
}

export interface DepartmentSummary {
  dept_key: string;
  name: string;
  status: "active" | "inactive";
  head_employee_number: string | null;
  employees_count: number;
}
export interface DirectoryRole {
  role_key: string;
  name: string;
  description: string | null;
}

/** Row from `employment_types` (FK target for `employees.employment_type`). */
export interface EmploymentType {
  type_key: string;
  name: string;
  description: string | null;
}

/** Row from `countries` (FK target for `employees.country`). */
export interface Country {
  country_key: string;
  name: string;
  description: string | null;
}
export type DirectoryRoleKey =
  | "employee"
  | "supervisor"
  | "hod"
  | "hr"
  | "admin"
  | "management"
  | "consultant";
export interface ListEmployeesByRoleInput {
  roleKey: DirectoryRoleKey;
  page: number;
  limit: number;
  search?: string;
}
export interface ListByRoleParams {
  roleKey: string;
  page: number;
  limit: number;
  search?: string;
}

export interface AssignRolePayload {
  directory_role: DirectoryRoleKey;
}
export interface DirectoryStatus {
  status_key: string;
  name: string;
  description: string | null;
}
export interface SetDepartmentHeadInput {
  dept_key: string;
  employee_number: string;
}

export interface AssignSupervisorInput {
  dept_key: string;
  employee_number: string;
}

export interface Location {
  location_key: string;
  name: string;
  is_head_office: boolean;
  status: string;
  /** UI grouping, e.g. Tanzania / Kenya / Uganda / Rwanda */
  country_group: string;
}

export interface Gender {
  gender_key: string;
  name: string;
  status: string;
}

export interface MaritalStatus {
  status_key: string;
  name: string;
  status: string;
}
export interface Company {
  company_key: string;
  name: string;
  legal_name: string;
  status: string;
}
export interface DepartmentFilters {
  company_key?: string;
}

