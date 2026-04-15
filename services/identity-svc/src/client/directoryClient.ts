import axios from "axios";

const DIRECTORY_BASE_URL = process.env.DIRECTORY_SVC_URL;
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;

export interface DirectoryEmployee {
  employee_number: string;
  directory_role: string;
  status: string;
  email: string;
}

export async function getDirectoryEmployee(
  params: { employee_number?: string; email?: string }
): Promise<DirectoryEmployee> {
    console.log("Directory Client Params:", params);
  if (!params.employee_number && !params.email) {
    throw new Error("employee_number or email is required");
  }

  const r = await axios.get<DirectoryEmployee>(
    `${DIRECTORY_BASE_URL}/internal/employees/employee`,
    {
      params,
      headers: {
        "x-internal-key": INTERNAL_KEY,
      },
    }
  );

  return r.data;
}

type SeedDirectoryEmployeePayload = {
  employee_number: string;
  full_name: string;
  email: string;
  department: string;
  title: string;
  employment_type: string;
  status: string;
  location: string;
  directory_role: string;
  company_key: string;
};

/**
 * Best-effort sync: upsert a demo employee into directory-svc.
 * Returns false when directory integration is not configured or call fails.
 */
export async function upsertDirectorySeedEmployee(
  payload: SeedDirectoryEmployeePayload
): Promise<boolean> {
  if (!DIRECTORY_BASE_URL || !INTERNAL_KEY) {
    return false;
  }

  const url = `${DIRECTORY_BASE_URL.replace(/\/$/, "")}/internal/employees/seed-upsert-employee`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await axios.post(url, payload, {
        headers: {
          "x-internal-key": INTERNAL_KEY,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });
      return true;
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      const shouldRetry =
        !status || status >= 500 || err?.code === "ECONNREFUSED" || err?.code === "ECONNABORTED";
      if (!shouldRetry || attempt === 5) {
        console.warn(
          "Directory seed upsert failed:",
          err?.response?.data || err?.message || err
        );
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return false;
}
