"use strict";
// src/controllers/internalController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeesByNumbers = exports.getDepartmentSummary = exports.getEmployeesByDepartment = exports.listHandoverCandidates = exports.listActiveEmployeesByCompany = exports.listActiveEmployees = exports.listEmployees = exports.internalGetEmployeeByEmail = exports.internalGetEmployee = void 0;
const employeeEngine_1 = require("../services/employeeEngine");
const directoryAnalyticsService_1 = require("../services/directoryAnalyticsService");
const directoryAnalyticsRepository_1 = require("../repositories/directoryAnalyticsRepository");
const connection_1 = require("../db/connection");
const engine = new employeeEngine_1.EmployeeEngine();
const analyticsRepo = new directoryAnalyticsRepository_1.DirectoryAnalyticsRepository(connection_1.pool);
const analyticsService = new directoryAnalyticsService_1.DirectoryAnalyticsService(analyticsRepo);
const internalGetEmployee = async (req, res) => {
    try {
        const { employee_number, email } = req.query;
        if (!employee_number && !email) {
            return res.status(400).json({
                error: "employee_number or email query parameter is required",
            });
        }
        let emp;
        if (employee_number) {
            emp = await engine.getById(String(employee_number));
        }
        else if (email) {
            emp = await engine.getByEmail(String(email));
        }
        if (!emp) {
            return res.status(404).json({ error: "Employee not found" });
        }
        return res.json(emp);
    }
    catch (err) {
        console.error("internalGetEmployee error", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.internalGetEmployee = internalGetEmployee;
const internalGetEmployeeByEmail = async (req, res) => {
    try {
        const emp = await engine.getByEmail(req.params.email);
        if (!emp)
            return res.status(404).json({ error: "Employee not found" });
        return res.json(emp);
    }
    catch (err) {
        console.error("internalGetEmployeeByEmail error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.internalGetEmployeeByEmail = internalGetEmployeeByEmail;
const listEmployees = async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 25;
        const filters = {
            page,
            limit,
            department: req.query.department,
            status: req.query.status,
            manager: req.query.manager,
            search: req.query.search,
        };
        const result = await engine.listEmployees(filters);
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.listEmployees = listEmployees;
const listActiveEmployees = async (req, res) => {
    try {
        const companyKey = req.query.company_key;
        const employees = companyKey
            ? await engine.listActiveEmployeesByCompany(companyKey.toUpperCase())
            : await engine.listActiveEmployees();
        return res.json({ count: employees.length, employees });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.listActiveEmployees = listActiveEmployees;
const listActiveEmployeesByCompany = async (req, res) => {
    try {
        const companyKey = req.query.company_key;
        if (!companyKey) {
            return res.status(400).json({
                error: "company_key query param is required",
            });
        }
        const employees = await engine.listActiveEmployeesByCompany(companyKey.toUpperCase());
        res.json({
            company_key: companyKey.toUpperCase(),
            count: employees.length,
            employees,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.listActiveEmployeesByCompany = listActiveEmployeesByCompany;
const listHandoverCandidates = async (req, res) => {
    try {
        const employee_number = String(req.query.employee_number ?? "").trim();
        const data = await engine.listHandoverCandidates(employee_number);
        return res.json(data);
    }
    catch (err) {
        const msg = err.message || "Internal server error";
        const isClient = /required|not found/i.test(msg);
        return res.status(isClient ? 400 : 500).json({ error: msg });
    }
};
exports.listHandoverCandidates = listHandoverCandidates;
const getEmployeesByDepartment = async (req, res) => {
    try {
        const { company_key, department } = req.query;
        if (!company_key || !department) {
            return res.status(400).json({
                error: "company_key and department are required",
            });
        }
        const employeeNumbers = await engine.getEmployeesByDepartment({
            companyKey: String(company_key),
            department: String(department),
        });
        return res.status(200).json({
            employee_numbers: employeeNumbers,
        });
    }
    catch (error) {
        console.error("getEmployeesByDepartment error:", error);
        return res.status(500).json({
            error: error.message || "Internal server error",
        });
    }
};
exports.getEmployeesByDepartment = getEmployeesByDepartment;
const getDepartmentSummary = async (req, res) => {
    try {
        const departments = await analyticsService.getDepartmentSummary();
        return res.json({
            departments,
        });
    }
    catch (error) {
        console.error("Failed to fetch department summary", error);
        return res.status(500).json({
            error: "Failed to fetch department summary",
        });
    }
};
exports.getDepartmentSummary = getDepartmentSummary;
const getEmployeesByNumbers = async (req, res) => {
    try {
        const { employee_numbers } = req.body;
        if (!Array.isArray(employee_numbers)) {
            return res.status(400).json({
                error: "employee_numbers must be an array",
            });
        }
        const employees = await analyticsService.getEmployeesByNumbers(employee_numbers);
        return res.json({ employees });
    }
    catch (err) {
        console.error("internalGetEmployeesByNumbers error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getEmployeesByNumbers = getEmployeesByNumbers;
