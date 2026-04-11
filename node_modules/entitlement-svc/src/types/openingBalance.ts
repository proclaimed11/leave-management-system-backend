export type OpeningBalanceImportStatus = "OK" | "FAILED" | "SKIPPED";

export interface OpeningBalanceRow {
  row: number;
  employee_number: string;
  leave_type_key: string;
  opening_balance: number; // remaining days to set at go-live
}

export interface OpeningBalanceRowError {
  row: number;
  employee_number?: string;
  field: "employee_number" | "leave_type_key" | "opening_balance" | "row";
  message: string;
}

/**
 * Preview/Commit row result:
 * - Always return the full row snapshot so frontend can show it in a table.
 */
export interface OpeningBalanceRowResult extends OpeningBalanceRow {
  import_status: OpeningBalanceImportStatus;
  message: string;
  carry_forward?: number; // optional (nice for preview UX)
  previous_balance?: number; // optional (nice for preview UX)
  resulting_balance?: number; // optional (nice for preview UX)
  entitlement_days?: number; // optional (nice for preview UX)
}

export interface OpeningBalancePreviewResponse {
  file_name: string;
  total_rows: number;
  valid_rows: number;
  skipped_rows: number;
  can_proceed: boolean;
  row_results: OpeningBalanceRowResult[];
  errors: OpeningBalanceRowError[];
}

export interface OpeningBalanceCommitResponse {
  file_name: string;
  total_rows: number;
  applied: number;
  skipped: number;
  row_results: OpeningBalanceRowResult[];
  errors: OpeningBalanceRowError[];
}
