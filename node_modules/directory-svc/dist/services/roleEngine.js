"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleEngine = void 0;
const roleReposirory_1 = require("../repositories/roleReposirory");
const roleValidator_1 = require("../validators/roleValidator");
class RoleEngine {
    repo;
    validator;
    constructor(repo = new roleReposirory_1.RoleRepository(), validator = new roleValidator_1.RoleAssignmentValidator()) {
        this.repo = repo;
        this.validator = validator;
    }
    async listAvailableRoles() {
        return this.repo.listRoles();
    }
    async assignRole(employeeNumber, roleKey, actorEmployeeNumber) {
        await this.validator.validateAssignRole({
            targetEmployeeNumber: employeeNumber,
            newRole: roleKey,
            actorEmployeeNumber,
        });
        return this.repo.updateRole(employeeNumber, roleKey);
    }
    async listEmployeesByRole(input) {
        const role = await this.repo.findByKey(input.roleKey);
        if (!role)
            throw new Error("Invalid role");
        const { total, employees } = await this.repo.listByRole(input);
        const totalPages = Math.max(1, Math.ceil(total / input.limit));
        return {
            page: input.page,
            limit: input.limit,
            count: employees.length,
            total,
            total_pages: totalPages,
            employees,
        };
    }
    async listHodCandidates(department) {
        if (!department) {
            throw new Error("Department is required");
        }
        return this.repo.listHodCandidatesByDepartment(department);
    }
    async listSupervisorCandidates(department) {
        if (!department) {
            throw new Error("Department is required");
        }
        return this.repo.listSupervisorCandidatesByDepartment(department);
    }
}
exports.RoleEngine = RoleEngine;
