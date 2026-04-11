import { RoleRow } from "../types/types";

export function hasRole(
  role: RoleRow["role_key"],
  required: RoleRow["role_key"]
): boolean {
  return role === required;
}

export function isAny(
  role: RoleRow["role_key"],
  ...allowed: RoleRow["role_key"][]
): boolean {
  return allowed.includes(role);
}

export function requireRole<T>(
  roles: RoleRow["role_key"],
  role: RoleRow["role_key"],
  action: () => T
): T {
  if (!hasRole(roles, role)) {
    throw new Error("Forbidden: missing role " + role);
  }
  return action();
}
