export interface LeaveCalendarQuery {
  start?: string; 
  end?: string; 
  date?: string; 
  department_id?: string;
  view?: "INDIVIDUAL" | "DEPARTMENT" | "COMPANY";
}
export interface LeaveCalendarRecord {
  leave_id: number;
  company_key: string;
  employee_number: string;
  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;
}

export type CalendarScope =
  | { type: "INDIVIDUAL"; employee_number: string }
  | { type: "DEPARTMENT"; department_id: string }
  | { type: "COMPANY" };

export interface LeaveCalendarRow {
  leave_id: number;
  employee_number: string;
  full_name: string;
  department_id: string;
  leave_type_key: string;
  start_date: string;
  end_date: string;
}

export interface LeaveCalendarResponse {
  range: {
    start: string;
    end: string;
  };
  scope: "INDIVIDUAL" | "DEPARTMENT" | "COMPANY";
  total: number;
  data: LeaveCalendarRow[];
}

export interface LeaveDayCountResponse {
  date: string;
  department_id?: string;
  count_on_leave: number;
}
