"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardEngine = void 0;
const dashboardRepository_1 = require("../repositories/dashboardRepository");
class DashboardEngine {
    repo;
    constructor(repo = new dashboardRepository_1.DashboardRepository()) {
        this.repo = repo;
    }
    async getOverview() {
        const kpis = await this.repo.getKPIs();
        const departments = await this.repo.getDepartmentsCount();
        const employeesByDepartment = await this.repo.employeesByDepartment();
        const employeesByRole = await this.repo.employeesByRole();
        return {
            kpis: {
                ...kpis,
                departments,
            },
            employeesByDepartment,
            employeesByRole,
        };
    }
    async getCountryOverview(countryPrefix) {
        if (!countryPrefix?.trim()) {
            throw new Error("country_prefix is required");
        }
        return this.repo.getCountryOverview(countryPrefix);
    }
}
exports.DashboardEngine = DashboardEngine;
