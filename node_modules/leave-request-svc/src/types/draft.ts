export interface CreateLeaveDraftInput {
  employee_number: string;
  leave_type_key: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
  source_plan_id: number;
}