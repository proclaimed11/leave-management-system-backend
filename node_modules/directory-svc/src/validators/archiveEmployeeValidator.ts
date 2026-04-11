import { EmployeeRepository } from "../repositories/employeeRepository";

export class ArchiveEmployeeValidator {
  constructor(private repo = new EmployeeRepository()) {}

  async validate(employeeNumber: string) {
    const employee = await this.repo.findByEmployeeNumber(employeeNumber);

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (employee.status === "ARCHIVED") {
      throw new Error("Employee is already archived");
    }

    const directReports = await this.repo.countSubordinates(employeeNumber);
    if (directReports > 0) {
      throw new Error(
        "Cannot archive employee with active direct reports"
      );
    }

    const isHOD = await this.repo.isHOD(employeeNumber);
    if (isHOD) {
      throw new Error(
        "Cannot archive employee while assigned as Head of Department"
      );
    }

    return employee;
  }
}
