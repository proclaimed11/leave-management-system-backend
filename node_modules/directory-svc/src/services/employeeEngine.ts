import { CompanyRepository } from "../repositories/companyRepository";
import { EmployeeRepository } from "../repositories/employeeRepository";
import { EmployeeFilters, EmployeeFull } from "../types/types";

export class EmployeeEngine {
  constructor(
    private repo = new EmployeeRepository(),
    private companyRepo = new CompanyRepository(),
  ) {}

  async createEmployee(data: EmployeeFull) {
    // We can validate required fields here
    if (!data.employee_number || !data.full_name || !data.email) {
      throw new Error("employee_number, full_name, and email are required");
    }

    return this.repo.createEmployee(data);
  }

  async listEmployees(filters: EmployeeFilters) {
    if (filters.company_key) {
      const exists = await this.companyRepo.exists(filters.company_key);
      if (!exists) {
        throw new Error("Invalid company selected");
      }
    }

    return this.repo.listEmployees(filters);
  }
  async listActiveEmployees() {
    return this.repo.listActiveEmployees();
  }
  async listActiveEmployeesByCompany(companyKey: string) {
    return this.repo.listActiveEmployeesByCompany(companyKey);
  }
  async getMyProfile(email: string) {
    return this.repo.findByEmail(email);
  }

  async updateMyPersonalDetails(empNo: string, data: any) {
    // remove forbidden fields
    delete data.full_name;
    delete data.email;
    delete data.department;
    delete data.title;
    delete data.manager_employee_number;
    delete data.status;

    return this.repo.updatePersonal(empNo, data);
  }

  async updateCoreEmployee(empNo: string, data: any) {
    return this.repo.updateCore(empNo, data);
  }

  async getById(empNo: string) {
    return this.repo.findByEmployeeNumber(empNo);
  }
  async getByEmail(email: string) {
    return this.repo.findByEmail(email);
  }
  async listManagerCandidates(deptKey: string) {
    if (!deptKey) {
      throw new Error("Department key is required");
    }

    return this.repo.listManagerCandidatesByDepartment(deptKey);
  }
  async listHandoverCandidates(employee_number: string) {
    if (!employee_number) throw new Error("employee_number is required");

    const me = await this.repo.findByEmployeeNumber(employee_number);
    if (!me) throw new Error(`Employee ${employee_number} not found`);

    if (!me.department) throw new Error("Employee has no department assigned");

    const employees = await this.repo.findActiveByDepartmentExcluding(
      me.department,
      me.employee_number,
    );

    return {
      department: me.department,
      count: employees.length,
      employees,
    };
  }
  async getEmployeesByDepartment(params: {
    companyKey: string;
    department: string;
  }): Promise<string[]> {
    const { companyKey, department } = params;
    if (!companyKey) {
      throw new Error("companyKey is required");
    }

    if (!department) {
      throw new Error("department is required");
    }

    const normalizedDepartment = department.trim();
    const employees = await this.repo.findActiveByCompanyAndDepartment({
      companyKey,
      department: normalizedDepartment,
    });
    return employees;
  }
}
