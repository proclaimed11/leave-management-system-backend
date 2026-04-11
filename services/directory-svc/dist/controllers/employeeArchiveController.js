"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveEmployee = void 0;
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
