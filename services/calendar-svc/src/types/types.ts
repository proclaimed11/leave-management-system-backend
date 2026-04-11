
export type ISODate = string;      // "2025-12-14"
export type YearMonth = string;    // "2025-12"

export interface CalendarDayRow {
  id: number;
  calendar_date: ISODate;
  department: string;
  employee_number: string;
  leave_type_key: string;
  created_at: string;
}
export interface CalendarSnapshotRow {
  id: number;
  department: string;
  year_month: YearMonth;
  total_employees: number;
  total_leaves: number;
  generated_at: string;
}
export interface DirectoryEmployee {
  employee_number: string;
  full_name: string;
  department: string | null;
  title: string | null;
  status: string | null; // active, terminated, etc.
}
export interface ApprovedLeave {
  id: number;
  employee_number: string;
  leave_type_key: string;
  start_date: ISODate;
  end_date: ISODate;
  total_days: number;
  status: string; // APPROVED only
}
export interface CalendarDayOutput {
  date: ISODate;
  employees: {
    employee_number: string;
    full_name: string;
    leave_type_key: string;
    department: string | null;
  }[];
}
export interface CalendarMonthView {
  year: number;
  month: number;
  days: CalendarDayOutput[];
}
export interface DepartmentConflict {
  date: ISODate;
  total_on_leave: number;
  employees: string[];
}
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MonthlySnapshotInput {
  department: string;
  year_month: YearMonth;
  total_employees: number;
  total_leaves: number;
}
export interface DirectoryProfile {
  employee_number: string;
  full_name: string;
  email: string;

  department?: string | null;
  title?: string | null;
  status?: string | null; // active, terminated, etc.

  manager_employee_number?: string | null;

  phone?: string | null;
  address?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;

  marital_status?: string | null;
  date_of_birth?: string | null;

  date_of_joining?: string | null; // YYYY-MM-DD
}
export interface ApprovedLeaveRow {
  id: number;

  employee_number: string;
  leave_type_key: string;

  start_date: string; // ISO date
  end_date: string;   // ISO date
  total_days: number;

  department?: string | null; // Provided by directory or enriched in engine

  created_at: string;
  updated_at: string;
}
