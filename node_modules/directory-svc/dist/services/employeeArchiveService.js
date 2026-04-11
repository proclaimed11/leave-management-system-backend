"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeArchiveService = void 0;
const employeeRepository_1 = require("../repositories/employeeRepository");
const archiveEmployeeValidator_1 = require("../validators/archiveEmployeeValidator");
class EmployeeArchiveService {
    repo;
    validator;
    constructor(repo = new employeeRepository_1.EmployeeRepository(), validator = new archiveEmployeeValidator_1.ArchiveEmployeeValidator()) {
        this.repo = repo;
        this.validator = validator;
    }
    async archive(employeeNumber) {
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
exports.EmployeeArchiveService = EmployeeArchiveService;
