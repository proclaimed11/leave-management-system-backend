"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDepartmentHead = exports.deleteDepartment = exports.updateDepartment = exports.getDepartment = exports.listDepartments = exports.createDepartment = void 0;
const departmentEngine_1 = require("../services/departmentEngine");
const departmentValidator_1 = require("../validators/departmentValidator");
const engine = new departmentEngine_1.DepartmentEngine();
const createDepartment = async (req, res) => {
    try {
        const input = (0, departmentValidator_1.validateCreateDepartment)(req);
        const dept = await engine.create(input);
        return res.status(201).json({ message: "Department created", department: dept });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.createDepartment = createDepartment;
const listDepartments = async (req, res) => {
    try {
        const companyKey = req.query.company_key;
        const departments = await engine.listSummaries({
            company_key: companyKey,
        });
        res.json({
            count: departments.length,
            departments,
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.listDepartments = listDepartments;
const getDepartment = async (req, res) => {
    try {
        const dept = await engine.get(req.params.dept_key);
        if (!dept)
            return res.status(404).json({ error: "Department not found" });
        return res.json(dept);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.getDepartment = getDepartment;
const updateDepartment = async (req, res) => {
    try {
        const patch = (0, departmentValidator_1.validateUpdateDepartment)(req);
        console.log("Patch:", patch);
        const dept = await engine.update(req.params.dept_key, patch);
        if (!dept)
            return res.status(404).json({ error: "Department not found" });
        return res.json({ message: "Department updated", department: dept });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (req, res) => {
    try {
        await engine.remove(req.params.dept_key);
        return res.json({ message: "Department deleted" });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.deleteDepartment = deleteDepartment;
const setDepartmentHead = async (req, res) => {
    try {
        const { head_employee_number } = req.body;
        const dept = await engine.setHead(req.params.dept_key, head_employee_number ?? null);
        if (!dept)
            return res.status(404).json({ error: "Department not found" });
        return res.json({ message: "Head updated", department: dept });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.setDepartmentHead = setDepartmentHead;
