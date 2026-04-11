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
