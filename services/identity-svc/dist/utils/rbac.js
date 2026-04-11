"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = hasRole;
exports.isAny = isAny;
exports.requireRole = requireRole;
function hasRole(role, required) {
    return role === required;
}
function isAny(role, ...allowed) {
    return allowed.includes(role);
}
function requireRole(roles, role, action) {
    if (!hasRole(roles, role)) {
        throw new Error("Forbidden: missing role " + role);
    }
    return action();
}
