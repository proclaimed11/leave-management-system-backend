"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleAssignmentValidator = void 0;
const employeeRepository_1 = require("../repositories/employeeRepository");
const roleReposirory_1 = require("../repositories/roleReposirory");
class RoleAssignmentValidator {
    roleRepo;
    employeeRepo;
    constructor(roleRepo = new roleReposirory_1.RoleRepository(), employeeRepo = new employeeRepository_1.EmployeeRepository()) {
        this.roleRepo = roleRepo;
        this.employeeRepo = employeeRepo;
    }
    async validateAssignRole(params) {
        const { targetEmployeeNumber, newRole, actorEmployeeNumber } = params;
        // 1. Prevent admin changing their own role
        if (actorEmployeeNumber === targetEmployeeNumber) {
            throw new Error("You cannot change your own role");
        }
        // 2. Role must exist
        const role = await this.roleRepo.findByKey(newRole);
        if (!role) {
            throw new Error("Invalid role selected");
        }
        // 3. Employee must exist
        const employee = await this.employeeRepo.findByEmployeeNumber(targetEmployeeNumber);
        if (!employee) {
            throw new Error("Employee not found");
        }
        // 4. Supervisor demotion guard
        if (employee.directory_role === "supervisor" && newRole !== "supervisor") {
            const reports = await this.roleRepo.countDirectReports(targetEmployeeNumber);
            if (reports > 0) {
                throw new Error("Cannot change role: employee still manages direct reports");
            }
        }
        // 5. HOD demotion guard
        if (employee.directory_role === "hod" && newRole !== "hod") {
            const deptCount = await this.roleRepo.countDepartmentsWhereHOD(targetEmployeeNumber);
            if (deptCount > 0) {
                throw new Error("Cannot change role: employee is currently assigned as Head of Department");
            }
        }
        return employee;
    }
}
exports.RoleAssignmentValidator = RoleAssignmentValidator;
