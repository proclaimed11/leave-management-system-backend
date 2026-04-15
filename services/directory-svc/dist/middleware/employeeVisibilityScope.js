"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveEmployeeVisibilityScope = resolveEmployeeVisibilityScope;
const employeeEngine_1 = require("../services/employeeEngine");
function getLocationPrefix(location) {
    const raw = String(location ?? "").trim().toUpperCase();
    if (!raw)
        return null;
    const prefix = raw.split("_")[0]?.trim();
    return prefix || null;
}
const engine = new employeeEngine_1.EmployeeEngine();
/**
 * Resolves data-visibility scope for "users table" access.
 * - admin/system_admin: all
 * - hr/management: same location prefix (e.g. TZ_*)
 * - hod/supervisor: same location prefix + same department
 * - employee/consultant: none
 */
async function resolveEmployeeVisibilityScope(req, res, next) {
    try {
        const me = req.user;
        const role = String(req.directory_role ?? "").toLowerCase().trim();
        if (me?.is_system_admin === true || role === "admin") {
            req.employee_visibility_scope = { mode: "all" };
            return next();
        }
        if (role === "employee" || role === "consultant") {
            req.employee_visibility_scope = { mode: "none" };
            return next();
        }
        const requesterEmpNo = String(me?.employee_number ?? "").trim();
        if (!requesterEmpNo) {
            res.status(403).json({ error: "Employee context required" });
            return;
        }
        const requester = await engine.getById(requesterEmpNo);
        if (!requester) {
            res.status(403).json({ error: "Requester employee profile not found" });
            return;
        }
        const locationPrefix = getLocationPrefix(requester.location);
        if (!locationPrefix) {
            res.status(403).json({ error: "Requester location is not configured" });
            return;
        }
        if (role === "hod" || role === "supervisor") {
            const department = String(requester.department ?? "").trim();
            if (!department) {
                res.status(403).json({ error: "Supervisor/HOD department is not configured" });
                return;
            }
            req.employee_visibility_scope = {
                mode: "location_department",
                location_prefix: locationPrefix,
                department,
            };
            return next();
        }
        if (role === "hr" || role === "management") {
            req.employee_visibility_scope = {
                mode: "location",
                location_prefix: locationPrefix,
            };
            return next();
        }
        req.employee_visibility_scope = { mode: "none" };
        return next();
    }
    catch (err) {
        console.error("Failed to resolve employee visibility scope", err);
        res.status(500).json({ error: "Failed to resolve data visibility scope" });
    }
}
