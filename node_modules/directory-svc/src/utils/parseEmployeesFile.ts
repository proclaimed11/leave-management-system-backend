import * as XLSX from "xlsx";
import { EmployeeRow } from "./upsertEmployeesInBatches";

export async function parseEmployeesBuffer(file: Express.Multer.File): Promise<EmployeeRow[]> {
  const buffer = file.buffer;

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });

  const parsed: EmployeeRow[] = rows.map((row: any) => ({
    employee_number: row["employee_number"]?.toString().trim(),
    full_name: row["full_name"]?.toString().trim(),
    email: row["email"]?.toString().trim(),
    department: row["department"]?.toString().trim() || null,
    title: row["title"]?.toString().trim() || null,
    status: row["status"]?.toString().trim() || "active",
    manager_employee_number: row["manager_employee_number"]?.toString().trim() || null,
    phone: row["phone"]?.toString().trim() || null,
    address: row["address"]?.toString().trim() || null,
    emergency_contact_name: row["emergency_contact_name"]?.toString().trim() || null,
    emergency_contact_phone: row["emergency_contact_phone"]?.toString().trim() || null,
    marital_status: row["marital_status"]?.toString().trim() || null,
    date_of_birth: row["date_of_birth"]?.toString().trim() || null
  }));

  return parsed;
}
