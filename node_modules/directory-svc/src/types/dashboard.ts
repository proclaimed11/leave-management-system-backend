export interface DashboardKPIs {
  totalEmployees: number;
  activeEmployees: number;
  archivedEmployees: number;
  departments: number;
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface DashboardOverview {
  kpis: DashboardKPIs;
  employeesByDepartment: DepartmentCount[];
  employeesByRole: RoleCount[];
}
