import axios from "axios";
import { DirectoryProfile } from "../types/types";

const BASE_URL = process.env.DIRECTORY_SVC_URL || "http://localhost:3002";

export class DirectoryApi {
  async getEmployee(
    empNo: string,
    authHeader?: string
  ): Promise<DirectoryProfile> {

    const res = await axios.get<DirectoryProfile>(
      `${BASE_URL}/employees/${empNo}`,
      { headers: authHeader ? { Authorization: authHeader } : undefined }
    );

    return res.data;
  }
  async getEmployeesByDepartment(
    department: string,
    authHeader?: string
  ): Promise<DirectoryProfile[]> {

    const res = await axios.get<{ department: string; count: number; employees: DirectoryProfile[] }>(
      `${BASE_URL}/department/${department}`,
      { headers: authHeader ? { Authorization: authHeader } : undefined }
    );

    return res.data.employees;
  }
  async getAllEmployees(authHeader?: string): Promise<DirectoryProfile[]> {
    const res = await axios.get<{ count: number; employees: DirectoryProfile[] }>(
      `${BASE_URL}/employees`,
      { headers: authHeader ? { Authorization: authHeader } : undefined }
    );

    return res.data.employees;
  }
}
