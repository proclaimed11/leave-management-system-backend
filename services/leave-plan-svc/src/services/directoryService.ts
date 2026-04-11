import axios from "axios";
import { CONFIG } from "../utils/config";
import { DirectoryProfile } from "../types/types";

export async function getSubordinates(
  managerEmpNo: string
): Promise<DirectoryProfile[]> {
  const res = await axios.get<{ subordinates: DirectoryProfile[] }>(
    `${CONFIG.DIRECTORY_SVC_URL}/internal/employees/${managerEmpNo}/subordinates`,
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    }
  );

  return res.data.subordinates || [];
}
