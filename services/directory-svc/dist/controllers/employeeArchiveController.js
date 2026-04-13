"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permanentDeleteEmployee = exports.restoreEmployee = exports.archiveEmployee = void 0;
const employeeArchiveService_1 = require("../services/employeeArchiveService");
const service = new employeeArchiveService_1.EmployeeArchiveService();
const archiveEmployee = async (req, res) => {
    try {
        const { employee_number } = req.params;
        const result = await service.archive(employee_number);
        res.json({
            message: "Employee archived successfully",
            ...result,
        });
    }
    catch (err) {
        res.status(400).json({
            error: err.message,
        });
    }
};
exports.archiveEmployee = archiveEmployee;
const restoreEmployee = async (req, res) => {
    try {
        const { employee_number } = req.params;
        const result = await service.restore(employee_number);
        res.json({
            message: "Employee restored successfully",
            ...result,
        });
    }
    catch (err) {
        res.status(400).json({
            error: err.message,
        });
    }
};
exports.restoreEmployee = restoreEmployee;
const permanentDeleteEmployee = async (req, res) => {
    try {
        const { employee_number } = req.params;
        const result = await service.deletePermanently(employee_number);
        res.json({
            message: "Employee permanently deleted",
            ...result,
        });
    }
    catch (err) {
        res.status(400).json({
            error: err.message,
        });
    }
};
exports.permanentDeleteEmployee = permanentDeleteEmployee;
