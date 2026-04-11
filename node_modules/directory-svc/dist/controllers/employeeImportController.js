"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitEmployeeImport = exports.previewEmployeeImport = void 0;
const employeeImportEngine_1 = require("../services/employeeImportEngine");
const engine = new employeeImportEngine_1.EmployeeImportEngine();
const previewEmployeeImport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "CSV file is required" });
        }
        if (!req.file.originalname.endsWith(".csv")) {
            return res.status(400).json({ error: "Only CSV files are supported" });
        }
        const summary = await engine.preview(req.file.originalname, req.file.buffer);
        res.json(summary);
    }
    catch (err) {
        res.status(500).json({
            error: "Failed to preview employee import",
            message: err.message,
        });
    }
};
exports.previewEmployeeImport = previewEmployeeImport;
const commitEmployeeImport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "CSV file is required" });
        }
        if (!req.file.originalname.endsWith(".csv")) {
            return res.status(400).json({ error: "Only CSV files are supported" });
        }
        const result = await engine.commit(req.file.originalname, req.file.buffer);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({
            error: "Failed to import employees",
            message: err.message,
        });
    }
};
exports.commitEmployeeImport = commitEmployeeImport;
