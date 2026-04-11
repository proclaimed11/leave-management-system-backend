import { Request } from "express";
import { CreateDepartmentInput, UpdateDepartmentInput, SetDepartmentHeadInput,AssignSupervisorInput } from "../types/types";

export function validateCreateDepartment(req: Request): CreateDepartmentInput {
  const { dept_key, name, status, head_employee_number, company_key } = req.body;


  return {
    dept_key: String(dept_key).toUpperCase(),
    name: String(name),
    company_key: company_key ?? null,
    status: status ?? "active",
    head_employee_number: head_employee_number ?? null
  };
}
export function validateUpdateDepartment(req: Request): UpdateDepartmentInput {
  const { name, status, company_key } = req.body ?? {};
  if (status && !["active", "inactive"].includes(status)) {
    throw new Error("Invalid status");
  }
  return { name, status, company_key };
}
export function validateSetDepartmentHead(
  req: Request
): SetDepartmentHeadInput {
  const { dept_key } = req.params;
  const { employee_number } = req.body;

  if (!dept_key) {
    throw new Error("Department key is required");
  }

  if (!employee_number) {
    throw new Error("employee_number is required");
  }

  return {
    dept_key: String(dept_key).toUpperCase(),
    employee_number: String(employee_number).toUpperCase(),
  };
}
export function validateAssignSupervisor(
  req: Request
): AssignSupervisorInput {
  const { dept_key } = req.params;
  const { employee_number } = req.body;

  if (!dept_key) {
    throw new Error("Department key is required");
  }

  if (!employee_number) {
    throw new Error("employee_number is required");
  }

  return {
    dept_key: String(dept_key).toUpperCase(),
    employee_number: String(employee_number).toUpperCase(),
  };
}

