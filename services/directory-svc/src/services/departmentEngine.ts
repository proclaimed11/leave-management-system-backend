import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DepartmentRow,
  DepartmentSummary,
} from "../types/types";
import { DepartmentRepository } from "../repositories/departmentRepository";
import { EmployeeRepository } from "../repositories/employeeRepository";

export class DepartmentEngine {
  constructor(
    private repo = new DepartmentRepository(),
    private empRepo = new EmployeeRepository()
  ) {}

  private normalizeKey(k: string) {
    return k.trim().toUpperCase().replace(/\s+/g, "_");
  }

  async create(input: CreateDepartmentInput): Promise<DepartmentRow> {
    console.log("Create Department Input:", input);
    const dept_key = this.normalizeKey(input.dept_key);
    const exists = await this.repo.exists(dept_key);
    if (exists) throw new Error(`Department '${dept_key}' already exists`);

    const head_employee_number = input.head_employee_number?.trim() || null;

    if (head_employee_number) {
      const ok = await this.repo.employeeExists(head_employee_number);
      if (!ok) {
        throw new Error(
          `Head employee '${input.head_employee_number}' does not exist in employees table`
        );
      }
    }
    return this.repo.create({
      ...input,
      dept_key,
      head_employee_number,
    });
  }

  async list(): Promise<DepartmentRow[]> {
    return this.repo.list();
  }

async listSummaries(filters?: { company_key?: string }): Promise<DepartmentSummary[]> {
  return this.repo.listSummaries(filters);
}

  async get(dept_key: string): Promise<DepartmentRow | null> {
    return this.repo.getByKey(this.normalizeKey(dept_key));
  }

  async update(
    dept_key: string,
    patch: UpdateDepartmentInput
  ): Promise<DepartmentRow | null> {
    return this.repo.update(this.normalizeKey(dept_key), patch);
  }

  async setHead(
    dept_key: string,
    employee_number: string | null
  ): Promise<DepartmentRow | null> {
    const key = this.normalizeKey(dept_key);

    if (employee_number) {
      const exists = await this.repo.employeeExists(employee_number);
      if (!exists) throw new Error("Employee does not exist");

      const inDept = await this.repo.employeeInDepartment(employee_number, key);
      if (!inDept) {
        throw new Error("Employee is not in this department");
      }
    }

    return this.repo.setHead(key, employee_number);
  }

  async remove(dept_key: string): Promise<void> {
    const key = this.normalizeKey(dept_key);
    const count = await this.repo.countEmployees(key);
    if (count > 0) {
      throw new Error(
        "Department has employees. Reassign them before deleting."
      );
    }
    await this.repo.delete(key);
  }

}
