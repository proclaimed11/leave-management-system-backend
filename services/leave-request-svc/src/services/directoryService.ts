import axios from "axios";
import type { ApprovalEmployee } from "../types/approval";
import { DirectoryProfile, HandoverCandidate } from "../types/types";
import { CONFIG } from "../utils/config";

export async function getEmployeeProfile(params: {
  employee_number?: string;
  email?: string;
}): Promise<DirectoryProfile> {
  if (!params.employee_number && !params.email) {
    throw new Error("employee_number or email is required");
  }

  const r = await axios.get<DirectoryProfile>(
    `${CONFIG.DIRECTORY_SVC_URL}/internal/employees/employee`,
    {
      params,
      headers: {
        "x-internal-key": CONFIG.INTERNAL_KEY,
      },
    },
  );
  return r.data;
}
export async function getHandoverCandidates(
  employeeNumber: string,
): Promise<HandoverCandidate[]> {
  const res = await axios.get<{ employees: HandoverCandidate[] }>(
    `${CONFIG.DIRECTORY_SVC_URL}/internal/employees/handover-candidates`,
    {
      params: { employee_number: employeeNumber },
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    },
  );

  return res.data.employees ?? [];
}

export async function getSubordinates(
  managerEmpNo: string,
): Promise<DirectoryProfile[]> {
  const res = await axios.get<{ subordinates: DirectoryProfile[] }>(
    `${CONFIG.DIRECTORY_SVC_URL}/internal/employees/${managerEmpNo}/subordinates`,
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    },
  );

  return res.data.subordinates || [];
}

export async function assertEmployeeExists(empNo: string): Promise<void> {
  await getEmployeeProfile({ employee_number: empNo });
}
export async function listActiveEmployees(): Promise<DirectoryProfile[]> {
  const res = await axios.get<{ employees: DirectoryProfile[] }>(
    `${CONFIG.DIRECTORY_SVC_URL}/internal/employees`,
    {
      params: { status: "ACTIVE" },
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    },
  );

  return res.data.employees ?? [];
}
export async function listActiveEmployeesCount(): Promise<number> {
  const res = await axios.get<{ employees: DirectoryProfile[]; total: number }>(
    `${CONFIG.DIRECTORY_SVC_URL}/internal/employees`,
    {
      params: { status: "ACTIVE", limit: 1 },
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    },
  );
  return res.data.total ?? 0;
}
export async function getEmployeesByDepartment(params: {
  companyKey: string;
  department: string;
}): Promise<DirectoryProfile[]> {
  const { companyKey, department } = params;

  const res = await axios.get<{
    employees?: DirectoryProfile[];
    employee_numbers?: string[];
  }>(`${CONFIG.DIRECTORY_SVC_URL}/internal/employees/by-department`, {
    params: { company_key: companyKey, department },
    headers: {
      "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
    },
  });

  if (Array.isArray(res.data.employees) && res.data.employees.length > 0) {
    return res.data.employees;
  }

  const nums = res.data.employee_numbers ?? [];
  if (!nums.length) return [];

  const profiles = await Promise.all(
    nums.map((n) => getEmployeeProfile({ employee_number: n })),
  );
  return profiles;
}

/**
 * Active HOD in the same company + department (directory_role hod), for approval routing
 * when no hod appears in the employee's reports_to chain.
 */
export async function findDepartmentHodEmployee(
  companyKey: string,
  department: string,
): Promise<ApprovalEmployee | null> {
  const co = String(companyKey ?? "").trim();
  const dept = String(department ?? "").trim();
  if (!co || !dept) return null;

  const employees = await getEmployeesByDepartment({ companyKey: co, department: dept });
  const hod = employees.find(
    (e) => String(e.directory_role ?? "").toLowerCase().trim() === "hod",
  );
  if (!hod) return null;

  return {
    employee_number: hod.employee_number,
    role: "hod",
    reports_to: hod.manager_employee_number ?? null,
    department_id: hod.department_id ?? null,
  };
}
export async function getDepartmentSummary(): Promise<
  { company_key: string; department: string; total: number }[]
> {
  const res = await axios.get<{
    departments: { company_key: string; department: string; total: number }[];
  }>(`${CONFIG.DIRECTORY_SVC_URL}/internal/employees/department-summary`, {
    headers: {
      "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
    },
  });

  return res.data.departments ?? [];
}
export async function getEmployeesByNumbers(
  employeeNumbers: string[],
): Promise<
  { employee_number: string; full_name: string; department: string | null; company_key: string }[]
> {
  if (!employeeNumbers.length) return [];

  const res = await axios.post<{
    employees: {
      employee_number: string;
      full_name: string;
      department: string | null;
      company_key: string;
    }[];
  }>(
    `${CONFIG.DIRECTORY_SVC_URL}/internal/employees/by-numbers`,
    {
      employee_numbers: employeeNumbers,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    },
  );

  return res.data.employees ?? [];
}
