"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSupervisorCandidates = exports.listHodCandidates = exports.listEmployeesByRole = exports.assignEmployeeRole = exports.listRoles = void 0;
const roleEngine_1 = require("../services/roleEngine");
const engine = new roleEngine_1.RoleEngine();
const listRoles = async (req, res) => {
    try {
        const roles = await engine.listAvailableRoles();
        res.json(roles);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.listRoles = listRoles;
const assignEmployeeRole = async (req, res) => {
    try {
        const { directory_role } = req.body;
        const empNo = req.params.employee_number;
        if (!directory_role) {
            return res.status(400).json({ error: "directory_role is required" });
        }
        const admin = req.user;
        const updated = await engine.assignRole(empNo, directory_role, admin.employee_number);
        res.json({
            message: "Role assigned successfully",
            employee: updated
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.assignEmployeeRole = assignEmployeeRole;
const listEmployeesByRole = async (req, res) => {
    try {
        const role = req.query.role;
        if (!role || typeof role !== "string") {
            return res.status(400).json({ error: "role query param is required" });
        }
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);
        const search = req.query.search?.trim();
        const result = await engine.listEmployeesByRole({
            roleKey: role,
            page,
            limit,
            search,
        });
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.listEmployeesByRole = listEmployeesByRole;
const listHodCandidates = async (req, res) => {
    try {
        const department = req.query.department;
        if (!department) {
            return res.status(400).json({
                error: "department query param is required",
            });
        }
        const employees = await engine.listHodCandidates(department);
        res.json({
            count: employees.length,
            employees,
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.listHodCandidates = listHodCandidates;
const listSupervisorCandidates = async (req, res) => {
    try {
        const department = req.query.department;
        if (!department) {
            return res.status(400).json({
                error: "department query param is required",
            });
        }
        const employees = await engine.listSupervisorCandidates(department);
        res.json({
            count: employees.length,
            employees,
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.listSupervisorCandidates = listSupervisorCandidates;
