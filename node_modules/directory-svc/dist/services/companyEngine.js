"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyEngine = void 0;
const companyRepository_1 = require("../repositories/companyRepository");
class CompanyEngine {
    repo;
    constructor(repo = new companyRepository_1.CompanyRepository()) {
        this.repo = repo;
    }
    async listCompanies() {
        return this.repo.listActive();
    }
    async getOverview(companyKey) {
        const kpis = await this.repo.getKPIs(companyKey);
        const departments = await this.repo.getDepartmentsCount(companyKey);
        const employeesByDepartment = await this.repo.employeesByDepartment(companyKey);
        const employeesByRole = await this.repo.employeesByRole(companyKey);
        return {
            kpis: {
                ...kpis,
                departments,
            },
            employeesByDepartment,
            employeesByRole,
        };
    }
}
exports.CompanyEngine = CompanyEngine;
