import {
  OpeningBalanceRow,
  OpeningBalanceRowError,
} from "../types/openingBalance";

const EMP_NO_REGEX = /^ESL-\d{3,}$/i; // adjust if you want strict ESL-001 format only
const TYPE_KEY_REGEX = /^[A-Z0-9_]{2,50}$/; // e.g. ANNUAL, SICK, COMP_OFF

export class OpeningBalanceValidator {

  validateRows(rows: OpeningBalanceRow[]) {
    const errors: OpeningBalanceRowError[] = [];
    const seenEmpType = new Set<string>();

    for (const r of rows) {
      const empNo = (r.employee_number ?? "").trim();
      const typeKey = (r.leave_type_key ?? "").trim().toUpperCase();

      // required fields
      if (!empNo) {
        errors.push({
          row: r.row,
          field: "employee_number",
          message: "Employee number is required",
        });
      } else if (!EMP_NO_REGEX.test(empNo)) {
        errors.push({
          row: r.row,
          employee_number: empNo,
          field: "employee_number",
          message: "Invalid employee number format (e.g., ESL-001)",
        });
      }

      if (!typeKey) {
        errors.push({
          row: r.row,
          employee_number: empNo || undefined,
          field: "leave_type_key",
          message: "Leave type key is required",
        });
      } else if (!TYPE_KEY_REGEX.test(typeKey)) {
        errors.push({
          row: r.row,
          employee_number: empNo || undefined,
          field: "leave_type_key",
          message: "Invalid leave type key (e.g., ANNUAL, SICK, COMP_OFF)",
        });
      }
     const balance = Number(r.opening_balance);
      // opening_balance validation
      if (balance === undefined || balance === null) {
        errors.push({
          row: r.row,
          employee_number: empNo || undefined,
          field: "opening_balance",
          message: "Opening balance is required",
        });
      } else if (
        typeof balance !== "number" ||
        Number.isNaN(balance)
      ) {
        errors.push({
          row: r.row,
          employee_number: empNo || undefined,
          field: "opening_balance",
          message: "Opening balance must be a number",
        });
      } else if (balance < 0) {
        errors.push({
          row: r.row,
          employee_number: empNo || undefined,
          field: "opening_balance",
          message: "Opening balance cannot be negative",
        });
      }

      // duplicate detection within the uploaded file: (employee_number + leave_type_key)
      if (empNo && typeKey) {
        const key = `${empNo.toUpperCase()}::${typeKey}`;
        if (seenEmpType.has(key)) {
          errors.push({
            row: r.row,
            employee_number: empNo,
            field: "row",
            message: `Duplicate row in file for (${empNo}, ${typeKey})`,
          });
        } else {
          seenEmpType.add(key);
        }
      }

      // normalize back
      r.employee_number = empNo.toUpperCase();
      r.leave_type_key = typeKey;
    }

    return { errors };
  }
}
