"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeEngine = void 0;
const companyRepository_1 = require("../repositories/companyRepository");
const employeeRepository_1 = require("../repositories/employeeRepository");
class EmployeeEngine {
    repo;
    companyRepo;
    constructor(repo = new employeeRepository_1.EmployeeRepository(), companyRepo = new companyRepository_1.CompanyRepository()) {
        this.repo = repo;
        this.companyRepo = companyRepo;
    }
    async createEmployee(data) {
        // We can validate required fields here
        if (!data.employee_number || !data.full_name || !data.email) {
            throw new Error("employee_number, full_name, and email are required");
        }
        return this.repo.createEmployee(data);
    }
    async listEmployees(filters) {
        if (filters.company_key) {
            const exists = await this.companyRepo.exists(filters.company_key);
            if (!exists) {
                throw new Error("Invalid company selected");
            }
        }
        return this.repo.listEmployees(filters);
    }
    async listActiveEmployees() {
        return this.repo.listActiveEmployees();
    }
    async listActiveEmployeesByCompany(companyKey) {
        return this.repo.listActiveEmployeesByCompany(companyKey);
    }
    async getMyProfile(email) {
        return this.repo.findByEmail(email);
    }
    async updateMyPersonalDetails(empNo, data) {
        // remove forbidden fields
        delete data.full_name;
        delete data.email;
        delete data.department;
        delete data.title;
        delete data.manager_employee_number;
        delete data.status;
        return this.repo.updatePersonal(empNo, data);
    }
    async updateCoreEmployee(empNo, data) {
        return this.repo.updateCore(empNo, data);
    }
    async getById(empNo) {
        return this.repo.findByEmployeeNumber(empNo);
    }
    async getByEmail(email) {
        return this.repo.findByEmail(email);
    }
    async listManagerCandidates(deptKey) {
        if (!deptKey) {
            throw new Error("Department key is required");
        }
        return this.repo.listManagerCandidatesByDepartment(deptKey);
    }
    async listHandoverCandidates(employee_number) {
        if (!employee_number)
            throw new Error("employee_number is required");
        const me = await this.repo.findByEmployeeNumber(employee_number);
        if (!me)
            throw new Error(`Employee ${employee_number} not found`);
        if (!me.department)
            throw new Error("Employee has no department assigned");
        const employees = await this.repo.findActiveByDepartmentExcluding(me.department, me.employee_number);
        return {
            department: me.department,
            count: employees.length,
            employees,
        };
    }
    async getEmployeesByDepartment(params) {
        const { companyKey, department } = params;
        if (!companyKey) {
            throw new Error("companyKey is required");
        }
        if (!department) {
            throw new Error("department is required");
        }
        const normalizedDepartment = department.trim();
        const employees = await this.repo.findActiveByCompanyAndDepartment({
            companyKey,
            department: normalizedDepartment,
        });
        return employees;
    }
}
exports.EmployeeEngine = EmployeeEngine;
