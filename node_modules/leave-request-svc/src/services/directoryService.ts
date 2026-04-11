import axios from "axios";
import { DirectoryProfile, HandoverCandidate } from "../types/types";
import { CONFIG } from "../utils/config";
import e from "express";

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

  const res = await axios.get<{ employees: DirectoryProfile[] }>(
    `${CONFIG.DIRECTORY_SVC_URL}/internal/employees/by-department`,
    {
      params: { company_key: companyKey, department },
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    },
  );

  return res.data.employees ?? [];
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
