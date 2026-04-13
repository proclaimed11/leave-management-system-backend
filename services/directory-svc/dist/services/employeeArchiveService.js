"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeArchiveService = void 0;
const employeeRepository_1 = require("../repositories/employeeRepository");
const identityClient_1 = require("../services/identityClient");
const archiveEmployeeValidator_1 = require("../validators/archiveEmployeeValidator");
const restoreEmployeeValidator_1 = require("../validators/restoreEmployeeValidator");
class EmployeeArchiveService {
    repo;
    archiveValidator;
    restoreValidator;
    constructor(repo = new employeeRepository_1.EmployeeRepository(), archiveValidator = new archiveEmployeeValidator_1.ArchiveEmployeeValidator(), restoreValidator = new restoreEmployeeValidator_1.RestoreEmployeeValidator()) {
        this.repo = repo;
        this.archiveValidator = archiveValidator;
        this.restoreValidator = restoreValidator;
    }
    async archive(employeeNumber) {
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
    async restore(employeeNumber) {
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
    async deletePermanently(employeeNumber) {
        await this.restoreValidator.validate(employeeNumber);
        const outcome = await this.repo.permanentlyDeleteEmployee(employeeNumber);
        if (!outcome.ok) {
            throw new Error("Failed to permanently delete employee");
        }
        const result = {
            employee_number: employeeNumber,
        };
        const identityBase = process.env.IDENTITY_BASE_URL?.trim();
        const serviceToken = process.env.SERVICE_AUTH_TOKEN?.trim();
        if (identityBase && serviceToken) {
            const idResult = await (0, identityClient_1.deleteIdentityUserForEmployee)({
                email: outcome.email,
                employee_number: outcome.employee_number,
            });
            if (idResult.ok && idResult.deleted) {
                result.identity_user_deleted = true;
            }
            else if (!idResult.ok && idResult.error) {
                result.identity_cleanup_error =
                    typeof idResult.error === "string"
                        ? idResult.error
                        : JSON.stringify(idResult.error);
            }
        }
        return result;
    }
}
exports.EmployeeArchiveService = EmployeeArchiveService;
