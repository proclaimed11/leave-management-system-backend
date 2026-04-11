"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveEmployeeValidator = void 0;
const employeeRepository_1 = require("../repositories/employeeRepository");
class ArchiveEmployeeValidator {
    repo;
    constructor(repo = new employeeRepository_1.EmployeeRepository()) {
        this.repo = repo;
    }
    async validate(employeeNumber) {
        const employee = await this.repo.findByEmployeeNumber(employeeNumber);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (employee.status === "ARCHIVED") {
            throw new Error("Employee is already archived");
        }
        const directReports = await this.repo.countSubordinates(employeeNumber);
        if (directReports > 0) {
            throw new Error("Cannot archive employee with active direct reports");
        }
        const isHOD = await this.repo.isHOD(employeeNumber);
        if (isHOD) {
            throw new Error("Cannot archive employee while assigned as Head of Department");
        }
        return employee;
    }
}
exports.ArchiveEmployeeValidator = ArchiveEmployeeValidator;
