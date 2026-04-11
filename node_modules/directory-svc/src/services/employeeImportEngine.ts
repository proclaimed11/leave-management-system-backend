import csv from "csv-parser";
import { Readable } from "stream";
import {
  EmployeeImportRow,
  EmployeeImportRowResult,
  PreviewSummary,
  RowValidationResult,
} from "../types/employeeImport";
import { EmployeeImportValidator } from "../validators/employeeImportValidator";
import { EmployeeRepository } from "../repositories/employeeRepository";

export class EmployeeImportEngine {
  constructor(
    private validator = new EmployeeImportValidator(),
    private employeeRepo = new EmployeeRepository()
  ) {}

  /**
   * Parse CSV buffer into rows
   */
  private async parseCsv(buffer: Buffer): Promise<EmployeeImportRow[]> {
    const rows: EmployeeImportRow[] = [];
    let rowNumber = 1; // header = 1

    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on("data", (data) => {
          rowNumber++;

          rows.push({
            row: rowNumber,
            employee_number: data.employee_number?.trim(),
            full_name: data.full_name?.trim(),
            email: data.email?.trim(),
            phone: data.phone?.trim(),
            location: data.location?.trim(),
            department: data.department?.trim(),
            role: data.role?.trim(),
            status: data.status?.trim(),
            title: data.title?.trim() || null,
          });
        })
        .on("end", () => resolve(rows))
        .on("error", reject);
    });
  }

  /**
   * PREVIEW (Dry Run)
   */
  async preview(fileName: string, buffer: Buffer): Promise<PreviewSummary> {
    const rows = await this.parseCsv(buffer);

    const validations: RowValidationResult[] = [];
    for (const row of rows) {
      const result = await this.validator.validateRow(row);
      validations.push(result);
    }

    const validRows = validations.filter((v) => v.valid);
    const invalidRows = validations.filter((v) => !v.valid);

    return {
      file_name: fileName,
      total_rows: rows.length,
      valid_rows: validRows.length,
      skipped_rows: invalidRows.length,
      can_proceed: validRows.length > 0,
      errors: invalidRows.flatMap((v) =>
        v.errors.map((err) => ({
          row: v.row,
          employee_number: v.employee_number,
          field: err.field,
          message: err.message,
        }))
      ),
    };
  }
  /**
   * COMMIT (Insert valid rows only)
   */
  async commit(
    fileName: string,
    buffer: Buffer
  ): Promise<{
    file_name: string;
    total_rows: number;
    imported: number;
    skipped: number;
    created_employee_numbers: string[];
    errors: Array<{
      row: number;
      employee_number?: string;
      field: string;
      message: string;
    }>;
  }> {
    const rows = await this.parseCsv(buffer);

    const validations: RowValidationResult[] = [];
    for (const row of rows) {
      const result = await this.validator.validateRow(row);
      validations.push(result);
    }

    const created: string[] = [];
    const errors: Array<{
      row: number;
      employee_number?: string;
      field: string;
      message: string;
    }> = [];

    for (const result of validations) {
      if (!result.valid) {
        result.errors.forEach((err) =>
          errors.push({
            row: result.row,
            employee_number: result.employee_number,
            field: err.field,
            message: err.message,
          })
        );
        continue;
      }

      // Insert valid employee
      const row = rows.find((r) => r.row === result.row)!;

      try {
        await this.employeeRepo.createEmployee({
          employee_number: row.employee_number,
          full_name: row.full_name,
          email: row.email,
          phone: row.phone,
          location: row.location,
          department: row.department,
          directory_role: row.role,
          title: row.title,
          status: "ACTIVE",
        } as any);

        created.push(row.employee_number);
      } catch (err: any) {
        // Defensive: DB constraint or race condition
        errors.push({
          row: result.row,
          employee_number: row.employee_number,
          field: "row",
          message: err.message || "Failed to create employee",
        });
      }
    }

    return {
      file_name: fileName,
      total_rows: rows.length,
      imported: created.length,
      skipped: rows.length - created.length,
      created_employee_numbers: created,
      errors,
    };
  }
  // async commit(fileName: string, buffer: Buffer) {
  //   const rows = await this.parseCsv(buffer);

  //   const rowResults: EmployeeImportRowResult[] = [];
  //   const normalize = (v?: string | null) => v ?? undefined;

  //   let imported = 0;

  //   for (const row of rows) {
  //     const validation = await this.validator.validateRow(row);

  //     const rowSnapshot: Omit<
  //       EmployeeImportRowResult,
  //       "import_status" | "message"
  //     > = {
  //       row: row.row,
  //       employee_number: row.employee_number,
  //       full_name: row.full_name,
  //       email: row.email,
  //       phone: row.phone,
  //       title: normalize(row.title),
  //       location: normalize(row.location),
  //       department: normalize(row.department),
  //       role: normalize(row.role),
  //       status: "ACTIVE",
  //     };

  //     if (!validation.valid) {
  //       rowResults.push({
  //         ...rowSnapshot,
  //         import_status: "FAILED",
  //         message: validation.errors
  //           .map((e) => `${e.field}: ${e.message}`)
  //           .join(" | "),
  //       });
  //       continue;
  //     }

  //     try {
  //       await this.employeeRepo.createEmployee({
  //         employee_number: row.employee_number,
  //         full_name: row.full_name,
  //         email: row.email,
  //         phone: row.phone,
  //         title: row.title,
  //         location: row.location,
  //         department: row.department,
  //         directory_role: row.role,
  //         status: "ACTIVE",
  //       } as any);

  //       imported++;

  //       rowResults.push({
  //         ...rowSnapshot,
  //         import_status: "SUCCESS",
  //         message: "Employee imported successfully",
  //       });
  //     } catch (err: any) {
  //       rowResults.push({
  //         ...rowSnapshot,
  //         import_status: "FAILED",
  //         message:
  //           err?.code === "23505"
  //             ? "Duplicate record detected"
  //             : err.message || "Failed to create employee",
  //       });
  //     }
  //   }

  //   return {
  //     file_name: fileName,
  //     total_rows: rows.length,
  //     imported,
  //     skipped: rows.length - imported,
  //     rows: rowResults,
  //   };
  // }
}
