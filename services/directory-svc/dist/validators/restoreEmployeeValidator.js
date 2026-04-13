"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreEmployeeValidator = void 0;
const employeeRepository_1 = require("../repositories/employeeRepository");
class RestoreEmployeeValidator {
    repo;
    constructor(repo = new employeeRepository_1.EmployeeRepository()) {
        this.repo = repo;
    }
    async validate(employeeNumber) {
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
exports.RestoreEmployeeValidator = RestoreEmployeeValidator;
