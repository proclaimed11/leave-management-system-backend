"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshots = exports.getDepartmentConflicts = exports.getCalendarMonth = exports.rebuildCalendar = void 0;
const calendarEngine_1 = require("../services/calendarEngine");
const engine = new calendarEngine_1.CalendarEngine();
/** ------------------------------------------
 *  POST /calendar/rebuild
 *  body: { year_month: "2025-12", department?: "Tech" }
 * ------------------------------------------ */
const rebuildCalendar = async (req, res) => {
    try {
        const { year_month, department } = req.body;
        const authHeader = req.headers.authorization;
        if (!year_month) {
            return res.status(400).json({ error: "year_month is required (YYYY-MM)" });
        }
        const data = await engine.rebuildMonth(year_month, department, authHeader);
        return res.json(data);
    }
    catch (err) {
        console.error("rebuildCalendar error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
};
exports.rebuildCalendar = rebuildCalendar;
/** ------------------------------------------
 *  GET /calendar/:year_month
 * ------------------------------------------ */
const getCalendarMonth = async (req, res) => {
    try {
        const { year_month } = req.params;
        if (!year_month) {
            return res.status(400).json({ error: "year_month is required (YYYY-MM)" });
        }
        const data = await engine.getMonth(year_month);
        return res.json(data);
    }
    catch (err) {
        console.error("getCalendarMonth error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
};
exports.getCalendarMonth = getCalendarMonth;
/** ------------------------------------------
 *  GET /calendar/conflicts/:department?threshold=3
 * ------------------------------------------ */
const getDepartmentConflicts = async (req, res) => {
    try {
        const { department } = req.params;
        const threshold = Number(req.query.threshold) || 3;
        if (!department) {
            return res.status(400).json({ error: "department is required" });
        }
        const data = await engine.getDepartmentConflicts(department, threshold);
        return res.json(data);
    }
    catch (err) {
        console.error("getDepartmentConflicts error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
};
exports.getDepartmentConflicts = getDepartmentConflicts;
/** ------------------------------------------
 *  GET /calendar/snapshots/:department
 * ------------------------------------------ */
const getSnapshots = async (req, res) => {
    try {
        const { department } = req.params;
        if (!department) {
            return res.status(400).json({ error: "department is required" });
        }
        const data = await engine.getSnapshots(department);
        return res.json(data);
    }
    catch (err) {
        console.error("getSnapshots error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
};
exports.getSnapshots = getSnapshots;
