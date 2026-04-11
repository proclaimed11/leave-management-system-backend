import axios from "axios";
import { ApprovedLeaveRow } from "../types/types";

const BASE_URL = process.env.LEAVE_REQUEST_SVC_URL || "http://localhost:3003";

export class LeaveRequestApi {
  async getApprovedLeavesByMonth(
    year_month: string,
    authHeader?: string
  ): Promise<ApprovedLeaveRow[]> {

    const res = await axios.get<{ month: string; count: number; leaves: ApprovedLeaveRow[] }>(
      `${BASE_URL}/internal/approved/${year_month}`,
      { headers: authHeader ? { Authorization: authHeader } : undefined }
    );

    return res.data.leaves;
  }
  async getApprovedLeavesForDepartment(
    department: string,
    authHeader?: string
  ): Promise<ApprovedLeaveRow[]> {

    const res = await axios.get<{ department: string; count: number; leaves: ApprovedLeaveRow[] }>(
      `${BASE_URL}/internal/department-approved/${department}`,
      { headers: authHeader ? { Authorization: authHeader } : undefined }
    );

    return res.data.leaves;
  }
}
