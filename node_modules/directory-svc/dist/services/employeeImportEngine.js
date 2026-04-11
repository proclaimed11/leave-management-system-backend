"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeImportEngine = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
const employeeImportValidator_1 = require("../validators/employeeImportValidator");
const employeeRepository_1 = require("../repositories/employeeRepository");
class EmployeeImportEngine {
    validator;
    employeeRepo;
    constructor(validator = new employeeImportValidator_1.EmployeeImportValidator(), employeeRepo = new employeeRepository_1.EmployeeRepository()) {
        this.validator = validator;
        this.employeeRepo = employeeRepo;
    }
    /**
     * Parse CSV buffer into rows
     */
    async parseCsv(buffer) {
        const rows = [];
        let rowNumber = 1; // header = 1
        return new Promise((resolve, reject) => {
            const stream = stream_1.Readable.from(buffer);
            stream
                .pipe((0, csv_parser_1.default)())
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
    async preview(fileName, buffer) {
        const rows = await this.parseCsv(buffer);
        const validations = [];
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
            errors: invalidRows.flatMap((v) => v.errors.map((err) => ({
                row: v.row,
                employee_number: v.employee_number,
                field: err.field,
                message: err.message,
            }))),
        };
    }
    /**
     * COMMIT (Insert valid rows only)
     */
    async commit(fileName, buffer) {
        const rows = await this.parseCsv(buffer);
        const validations = [];
        for (const row of rows) {
            const result = await this.validator.validateRow(row);
            validations.push(result);
        }
        const created = [];
        const errors = [];
        for (const result of validations) {
            if (!result.valid) {
                result.errors.forEach((err) => errors.push({
                    row: result.row,
                    employee_number: result.employee_number,
                    field: err.field,
                    message: err.message,
                }));
                continue;
            }
            // Insert valid employee
            const row = rows.find((r) => r.row === result.row);
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
                });
                created.push(row.employee_number);
            }
            catch (err) {
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
}
exports.EmployeeImportEngine = EmployeeImportEngine;
