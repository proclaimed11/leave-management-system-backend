"use strict";
// src/services/managerEngine.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerEngine = void 0;
const managerRepository_1 = require("../repositories/managerRepository");
class ManagerEngine {
    repo;
    constructor(repo = new managerRepository_1.ManagerRepository()) {
        this.repo = repo;
    }
    async getSubordinates(managerId, page, limit) {
        const offset = (page - 1) * limit;
        const subs = await this.repo.getSubordinates(managerId, limit, offset);
        const count = await this.repo.getSubordinatesCount(managerId);
        return {
            manager: managerId,
            page,
            limit,
            count,
            subordinates: subs
        };
    }
    async getReportingChain(empNo) {
        const chain = [];
        let current = empNo;
        while (true) {
            const emp = await this.repo.getEmployeeForChain(current);
            if (!emp)
                break;
            const manager = emp.manager_employee_number;
            if (!manager)
                break;
            const mgr = await this.repo.getEmployeeForChain(manager);
            if (!mgr)
                break;
            chain.push({
                employee_number: mgr.employee_number,
                full_name: mgr.full_name
            });
            current = mgr.employee_number;
            // end at top
            if (!mgr.manager_employee_number)
                break;
        }
        return { employee: empNo, chain };
    }
}
exports.ManagerEngine = ManagerEngine;
