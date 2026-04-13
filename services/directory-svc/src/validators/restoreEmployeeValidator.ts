import { EmployeeRepository } from "../repositories/employeeRepository";

export class RestoreEmployeeValidator {
  constructor(private repo = new EmployeeRepository()) {}

  async validate(employeeNumber: string) {
    const employee = await this.repo.findByEmployeeNumber(employeeNumber);

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (employee.status !== "ARCHIVED") {
      throw new Error("Only archived employees can be restored");
    }

    return employee;
  }
}
