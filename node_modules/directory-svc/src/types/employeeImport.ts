export type DirectoryRoleKey =
  | "employee"
  | "supervisor"
  | "hod"
  | "hr"
  | "admin"
  | "management"
  | "consultant";

export interface EmployeeImportRow {
  row: number; // 1-based (header = 1), data typically starts at 2
  employee_number: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  role: DirectoryRoleKey | string; // validate to DirectoryRoleKey
  status: string; // must be "ACTIVE"
  title?: string | null;
}

export interface RowValidationError {
  field: keyof Omit<EmployeeImportRow, "row"> | "row";
  message: string;
}

export interface RowValidationResult {
  row: number;
  employee_number?: string;
  valid: boolean;
  errors: RowValidationError[];
}

export interface PreviewSummary {
  file_name: string;
  total_rows: number;
  valid_rows: number;
  skipped_rows: number;
  can_proceed: boolean;
  errors: Array<{
    row: number;
    employee_number?: string;
    field: string;
    message: string;
  }>;
}

export type ImportStatus = "SUCCESS" | "FAILED" | "SKIPPED";

export interface EmployeeImportRowResult {
  row: number;

  employee_number?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  title?: string;
  location?: string;
  department?: string;
  role?: string;
  status?: string;
  import_status: ImportStatus;
  message?: string;
}
