export interface ArchiveEmployeeResult {
  employee_number: string;
  status: "ARCHIVED";
  termination_date: string;
}

export interface RestoreEmployeeResult {
  employee_number: string;
  status: "ACTIVE";
}

export interface PermanentDeleteEmployeeResult {
  employee_number: string;
  /** True when identity-svc removed a matching `users` row. */
  identity_user_deleted?: boolean;
  /** Set when identity cleanup was attempted but failed (directory row is already gone). */
  identity_cleanup_error?: string;
}
