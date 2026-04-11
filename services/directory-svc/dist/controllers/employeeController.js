"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listManagerCandidates = exports.getEmployeeById = exports.updateEmployee = exports.updateMyProfile = exports.getMyProfile = exports.listEmployees = exports.createEmployee = void 0;
const employeeEngine_1 = require("../services/employeeEngine");
const engine = new employeeEngine_1.EmployeeEngine();
const createEmployee = async (req, res, next) => {
    try {
        const employee = await engine.createEmployee(req.body);
        // const identityResult = await onboardIdentityUser(employee);
        return res.json({
            message: "Employee created",
            employee,
        });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.createEmployee = createEmployee;
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
            company_key: req.query.company_key,
        };
        const result = await engine.listEmployees(filters);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.listEmployees = listEmployees;
const getMyProfile = async (req, res) => {
    const me = req.user;
    const profile = await engine.getMyProfile(me.email);
    if (!profile) {
        res.status(404).json({ error: "Profile not found" });
        return;
    }
    res.json(profile);
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res) => {
    const me = req.user;
    const updated = await engine.updateMyPersonalDetails(me.employee_number, req.body);
    res.json({ message: "Profile updated", profile: updated });
};
exports.updateMyProfile = updateMyProfile;
const updateEmployee = async (req, res) => {
    const updated = await engine.updateCoreEmployee(req.params.employee_number, req.body);
    res.json({ message: "Employee updated", employee: updated });
};
exports.updateEmployee = updateEmployee;
const getEmployeeById = async (req, res) => {
    const emp = await engine.getById(req.params.employee_number);
    if (!emp) {
        res.status(404).json({ error: "Not found" });
        return;
    }
    res.json(emp);
};
exports.getEmployeeById = getEmployeeById;
const listManagerCandidates = async (req, res) => {
    try {
        const department = req.query.department;
        if (!department) {
            return res.status(400).json({
                error: "department query param is required",
            });
        }
        const managers = await engine.listManagerCandidates(department.toUpperCase());
        res.json({
            count: managers.length,
            managers,
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.listManagerCandidates = listManagerCandidates;
