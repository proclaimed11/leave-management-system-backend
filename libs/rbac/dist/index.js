"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalOnly = exports.managerOnly = exports.staffOnly = exports.managementOnly = exports.supervisorOrAbove = exports.adminOnly = exports.hrOrAdmin = exports.requireDirectoryRole = void 0;
const requireDirectoryRole = (allowed) => (req, res, next) => {
    const role = req.directory_role;
    if (!role) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    if (!allowed.includes(role)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    next();
};
exports.requireDirectoryRole = requireDirectoryRole;
exports.hrOrAdmin = (0, exports.requireDirectoryRole)(["hr", "admin"]);
exports.adminOnly = (0, exports.requireDirectoryRole)(["admin"]);
exports.supervisorOrAbove = (0, exports.requireDirectoryRole)([
    "supervisor",
    "hod",
    "management",
    "hr",
    "admin",
]);
exports.managementOnly = (0, exports.requireDirectoryRole)(["management", "admin"]);
exports.staffOnly = (0, exports.requireDirectoryRole)([
    "employee",
    "supervisor",
    "hod",
    "management",
    "hr",
    "admin",
]);
exports.managerOnly = (0, exports.requireDirectoryRole)([
    "supervisor",
    "hod",
    "admin",
]);
const internalOnly = (req, res, next) => {
    const internalKey = req.headers["x-internal-key"];
    if (!internalKey) {
        res.status(401).json({
            error: "Missing internal service key",
        });
    }
    if (internalKey !== process.env.INTERNAL_SERVICE_KEY) {
        res.status(403).json({
            error: "Invalid internal service key",
        });
    }
    next();
};
exports.internalOnly = internalOnly;
