import { EmployeeRepository } from "../repositories/employeeRepository";
import { ArchiveEmployeeValidator } from "../validators/archiveEmployeeValidator";
import { ArchiveEmployeeResult } from "../types/employeeArchive";

export class EmployeeArchiveService {
  constructor(
    private repo = new EmployeeRepository(),
    private validator = new ArchiveEmployeeValidator()
  ) {}

  async archive(employeeNumber: string): Promise<ArchiveEmployeeResult> {
    // 1. Validate rules
    await this.validator.validate(employeeNumber);

    // 2. Archive employee
    const archived = await this.repo.archiveEmployee(employeeNumber);

    if (!archived) {
      throw new Error("Failed to archive employee");
    }

    return {
      employee_number: archived.employee_number,
      status: "ARCHIVED",
      termination_date: archived.termination_date,
    };
  }
}
