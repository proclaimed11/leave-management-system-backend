export type UUID = string;

// DB rows
export interface UserRow {
  id: number;
  employee_number: string | null;
  email: string;
  password_hash: string | null;// null for SSO-only accounts
  must_change_password: boolean;
  is_active: "active";
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface RoleRow {
  id: number;
  role_key: "employee" | "supervisor" | "hod" | "HR" | "admin" | "management" | "consultant";
  description: string | null;
}

export interface UserRoleRow {
  user_id: number;
  role_id: number;
  granted_by: number | null;
  granted_at: string; // ISO
}

export interface JwtUser {
  sub: number;                 // user id
  email: string;
  employee_number: string | null;
  is_system_admin: boolean;
  /** Omitted on legacy tokens; treat undefined as false. */
  must_change_password?: boolean;
}


// Login inputs
export interface LoginRequest {
  email: string;
  password: string;
}


// For role assignment
export interface AssignRoleInput {
  user_id: number;
  role_key: RoleRow["role_key"];
}

// Generic API error shape
export interface ApiError {
  error: string;
  details?: unknown;
}
export type LoginResult = {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    employee_number: string | null;
    email: string;
    is_system_admin: boolean;
    must_change_password: boolean;
  };
};
