"use strict";
// src/controllers/managerController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportingChain = exports.getSubordinates = void 0;
const managerEngine_1 = require("../services/managerEngine");
const engine = new managerEngine_1.ManagerEngine();
const getSubordinates = async (req, res) => {
    try {
        const managerId = req.params.manager_id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 25;
        const data = await engine.getSubordinates(managerId, page, limit);
        return res.json(data);
    }
    catch (err) {
        console.error("getSubordinates error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getSubordinates = getSubordinates;
const getReportingChain = async (req, res) => {
    try {
        const empNo = req.params.employee_number;
        const data = await engine.getReportingChain(empNo);
        return res.json(data);
    }
    catch (err) {
        console.error("reportingChain error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getReportingChain = getReportingChain;
