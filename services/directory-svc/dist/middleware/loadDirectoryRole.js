"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDirectoryRole = void 0;
const connection_1 = require("../db/connection");
const loadDirectoryRole = async (req, res, next) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    if (user.is_system_admin === true) {
        req.directory_role = "admin";
        return next();
    }
    if (!user.employee_number) {
        res.status(403).json({ error: "Employee context required" });
        return;
    }
    try {
        const r = await connection_1.pool.query(`
      SELECT directory_role
      FROM employees
      WHERE employee_number = $1
        AND status = 'ACTIVE'
      `, [user.employee_number]);
        if (r.rows.length === 0) {
            res.status(403).json({ error: "Employee not found or inactive" });
            return;
        }
        req.directory_role = r.rows[0].directory_role.toLowerCase();
        next();
    }
    catch (err) {
        console.error("Failed to load directory role", err);
        res.status(500).json({ error: "Failed to resolve user role" });
    }
};
exports.loadDirectoryRole = loadDirectoryRole;
