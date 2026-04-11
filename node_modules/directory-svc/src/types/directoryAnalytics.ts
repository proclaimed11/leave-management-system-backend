export interface DepartmentSummaryRow {
  department: string;
  total: number; 
 company_key: string;

}

export interface DepartmentSummaryResponse {
  departments: DepartmentSummaryRow[];
}
export interface EmployeeBasic {
  employee_number: string;
  full_name: string;
  department: string | null;
   company_key: string;
}
