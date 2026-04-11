import {
  DirectoryRoleKey,
  EmployeeImportRow,
  RowValidationResult,
} from "../types/employeeImport";
import { EmployeeRepository } from "../repositories/employeeRepository";
import { DepartmentRepository } from "../repositories/departmentRepository";
import { RoleRepository } from "../repositories/roleReposirory";
import { LocationRepository } from "../repositories/locationRepository";

const COMPANY_EMAIL_DOMAIN = "@esl-africa.com";

// Kenyan local mobile: 10 digits, starts 07 or 01 (e.g., 0794375045 or 0112345678)
const PHONE_REGEX = /^(07|01)\d{8}$/;

// Full name: at least two alphabetic tokens (allow spaces & hyphens/apostrophes)
const NAME_TOKEN = /^[A-Za-z][A-Za-z'\-]*$/;

function isValidFullName(name: string): boolean {
  const trimmed = (name || "").trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return false;
  return parts.every((p) => NAME_TOKEN.test(p));
}

function isValidCompanyEmail(email: string): boolean {
  const e = (email || "").trim().toLowerCase();
  if (!e.includes("@")) return false;
  if (!e.endsWith(COMPANY_EMAIL_DOMAIN)) return false;
  // basic local-part check
  const [local] = e.split("@");
  return !!local && local.length > 1;
}

export class EmployeeImportValidator {
  constructor(
    private employees = new EmployeeRepository(),
    private departments = new DepartmentRepository(),
    private roles = new RoleRepository(),
    private locations = new LocationRepository() // ✅ ADD
  ) {}

  /**
   * Validate a single CSV row against all business rules.
   * - Performs DB lookups for duplicates, department, role.
   * - Returns a RowValidationResult with errors if any.
   */
  async validateRow(row: EmployeeImportRow): Promise<RowValidationResult> {
    const errors: RowValidationResult["errors"] = [];

    // Normalize fields
    const empNo = (row.employee_number || "").trim();
    const fullName = (row.full_name || "").trim();
    const email = (row.email || "").trim();
    const phone = (row.phone || "").trim();
    const location = (row.location || "").trim().toUpperCase();
    const department = (row.department || "").trim();
    const roleKey = (row.role || "").toString().trim().toLowerCase();
    const status = (row.status || "").trim().toUpperCase();
    const title = row.title?.trim() || null;

    // Required checks
    if (!empNo)
      errors.push({
        field: "employee_number",
        message: "Employee number is required",
      });
    if (!fullName)
      errors.push({ field: "full_name", message: "Full name is required" });
    if (!email) errors.push({ field: "email", message: "Email is required" });
    if (!phone) errors.push({ field: "phone", message: "Phone is required" });
    if (!location)
      errors.push({ field: "location", message: "Location is required" });
    if (!department)
      errors.push({ field: "department", message: "Department is required" });
    if (!roleKey) errors.push({ field: "role", message: "Role is required" });
    if (!status)
      errors.push({ field: "status", message: "Status is required" });
    if (!title) errors.push({ field: "title", message: "Title is required" });

    // Short-circuit if required fields already missing
    if (errors.length === 0) {
      // Employee number uniqueness (system)
      if (await this.employees.existsEmployeeNumber(empNo)) {
        errors.push({
          field: "employee_number",
          message: "Duplicate employee number (already exists)",
        });
      }

      // Email format & uniqueness
      if (!isValidCompanyEmail(email)) {
        errors.push({
          field: "email",
          message: `Email must be a valid company email (${COMPANY_EMAIL_DOMAIN})`,
        });
      } else if (await this.employees.existsEmail(email)) {
        errors.push({
          field: "email",
          message: "Duplicate email (already exists)",
        });
      }

      // Phone format (local Kenyan)
      if (!PHONE_REGEX.test(phone)) {
        errors.push({
          field: "phone",
          message:
            "Phone number must be 10 digits and start with 07 or 01 (e.g., 0794375045)",
        });
      }

      // Full name shape
      if (!isValidFullName(fullName)) {
        errors.push({
          field: "full_name",
          message:
            "Full name must contain at least first and last name and only letters",
        });
      }

      // Location must exist (FK-safe)
      if (!(await this.locations.exists(location))) {
        errors.push({
          field: "location",
          message: "Invalid location selected",
        });
      }

      // Department exists
      if (!(await this.departments.existsByName(department))) {
        errors.push({
          field: "department",
          message: "Department does not exist",
        });
      }

      // Role exists
      if (!(await this.roles.exists(roleKey))) {
        errors.push({ field: "role", message: "Invalid role selected" });
      }

      // Status must be ACTIVE
      if (status !== "ACTIVE") {
        errors.push({ field: "status", message: "Status must be ACTIVE" });
      }
      if (title && typeof title !== "string") {
        errors.push({
          field: "title",
          message: "Title must be a valid string",
        });
      }
    }

    return {
      row: row.row,
      employee_number: empNo || undefined,
      valid: errors.length === 0,
      errors,
    };
  }
}
