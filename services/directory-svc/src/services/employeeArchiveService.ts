import { EmployeeRepository } from "../repositories/employeeRepository";
import { deleteIdentityUserForEmployee } from "../services/identityClient";
import { ArchiveEmployeeValidator } from "../validators/archiveEmployeeValidator";
import { RestoreEmployeeValidator } from "../validators/restoreEmployeeValidator";
import {
  ArchiveEmployeeResult,
  PermanentDeleteEmployeeResult,
  RestoreEmployeeResult,
} from "../types/employeeArchive";

export class EmployeeArchiveService {
  constructor(
    private repo = new EmployeeRepository(),
    private archiveValidator = new ArchiveEmployeeValidator(),
    private restoreValidator = new RestoreEmployeeValidator()
  ) {}

  async archive(employeeNumber: string): Promise<ArchiveEmployeeResult> {
    // 1. Validate rules
    await this.archiveValidator.validate(employeeNumber);

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

  async restore(employeeNumber: string): Promise<RestoreEmployeeResult> {
    await this.restoreValidator.validate(employeeNumber);

    const restored = await this.repo.restoreEmployee(employeeNumber);

    if (!restored) {
      throw new Error("Failed to restore employee");
    }

    return {
      employee_number: restored.employee_number,
      status: "ACTIVE",
    };
  }

  async deletePermanently(
    employeeNumber: string,
  ): Promise<PermanentDeleteEmployeeResult> {
    await this.restoreValidator.validate(employeeNumber);

    const outcome = await this.repo.permanentlyDeleteEmployee(employeeNumber);

    if (!outcome.ok) {
      throw new Error("Failed to permanently delete employee");
    }

    const result: PermanentDeleteEmployeeResult = {
      employee_number: employeeNumber,
    };

    const identityBase = process.env.IDENTITY_BASE_URL?.trim();
    const serviceToken = process.env.SERVICE_AUTH_TOKEN?.trim();
    if (identityBase && serviceToken) {
      const idResult = await deleteIdentityUserForEmployee({
        email: outcome.email,
        employee_number: outcome.employee_number,
      });
      if (idResult.ok && idResult.deleted) {
        result.identity_user_deleted = true;
      } else if (!idResult.ok && idResult.error) {
        result.identity_cleanup_error =
          typeof idResult.error === "string"
            ? idResult.error
            : JSON.stringify(idResult.error);
      }
    }

    return result;
  }
}
