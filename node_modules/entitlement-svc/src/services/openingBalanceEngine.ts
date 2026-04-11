// src/services/openingBalanceEngine.ts

import {
  OpeningBalanceRow,
  OpeningBalancePreviewResponse,
  OpeningBalanceCommitResponse,
  OpeningBalanceRowResult,
} from "../types/openingBalance";
import { OpeningBalanceValidator } from "../validators/openingBalanceValidator";
import { EntitlementRepository } from "../repositories/entitlementRepository";
import { parseCsvBuffer } from "../utils/csvParser";
import axios from "axios";
import { parse } from "csv-parse/sync";

export class OpeningBalanceEngine {
  constructor(
    private repo = new EntitlementRepository(),
    private validator = new OpeningBalanceValidator(),
    private http = axios
  ) {}

  private currentYear = new Date().getFullYear();

  private parseCsv(buffer: Buffer): OpeningBalanceRow[] {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records.map((r: any, index: number) => ({
      row: index + 2,
      employee_number: String(r.employee_number).trim(),
      leave_type_key: String(r.leave_type_key).trim(),
      opening_balance: Number(r.opening_balance),
    }));
  }
  async preview(
    fileName: string,
    buffer: Buffer
  ): Promise<OpeningBalancePreviewResponse> {
    const rows = await this.parseCsv(buffer);
    const { errors } = await this.validator.validateRows(rows);

    const rowResults: OpeningBalanceRowResult[] = [];
    let validRows = 0;

    for (const r of rows) {
      const base: OpeningBalanceRowResult = {
        ...r,
        import_status: "OK",
        message: "Ready",
      };

      const rowErrors = errors.filter((e) => e.row === r.row);
      if (rowErrors.length) {
        rowResults.push({
          ...base,
          import_status: "FAILED",
          message: rowErrors.map((e) => e.message).join(", "),
        });
        continue;
      }

      const ent = await this.repo.getEntitlement(
        r.employee_number,
        r.leave_type_key,
        this.currentYear
      );

      if (!ent) {
        rowResults.push({
          ...base,
          import_status: "FAILED",
          message: "Entitlement not generated for this employee",
        });
        continue;
      }

      const alreadyApplied = await this.repo.hasOpeningBalance(
        r.employee_number,
        r.leave_type_key,
        this.currentYear
      );

      if (alreadyApplied) {
        rowResults.push({
          ...base,
          import_status: "SKIPPED",
          message: "Opening balance already applied",
        });
        continue;
      }

      const totalDays = Number(ent.total_days);
      const openingBalance = Number(r.opening_balance);

      // 🧠 SYSTEM COMPUTATION (same as commit)
      const carryForward =
        r.leave_type_key === "ANNUAL" && openingBalance > totalDays
          ? openingBalance - totalDays
          : 0;

      validRows++;

      rowResults.push({
        ...base,

        entitlement_days: totalDays,
        carry_forward: carryForward,
        previous_balance: Number(ent.remaining_days),
        resulting_balance: openingBalance,
      });
    }

    return {
      file_name: fileName,
      total_rows: rows.length,
      valid_rows: validRows,
      skipped_rows: rows.length - validRows,
      can_proceed: validRows > 0,
      row_results: rowResults,
      errors,
    };
  }

  async commit(
    fileName: string,
    rows: OpeningBalanceRow[]
  ): Promise<OpeningBalanceCommitResponse> {
    const rowResults: OpeningBalanceRowResult[] = [];
    let applied = 0;

    for (const r of rows) {
      await this.repo.withTx(async (c) => {
        const ent = await this.repo.lockEntitlement(
          c,
          r.employee_number,
          r.leave_type_key,
          this.currentYear
        );

        if (!ent) {
          rowResults.push({
            ...r,
            import_status: "FAILED",
            message: "Entitlement not found",
          });
          return;
        }

        const alreadyApplied = await this.repo.hasOpeningBalance(
          r.employee_number,
          r.leave_type_key,
          this.currentYear
        );

        if (alreadyApplied) {
          rowResults.push({
            ...r,
            import_status: "SKIPPED",
            message: "Opening balance already applied",
          });
          return;
        }

        const totalDays = Number(ent.total_days); // policy (e.g. 21)
        const oldRemaining = Number(ent.remaining_days);
        const openingBalance = Number(r.opening_balance);

        const carryForward =
          r.leave_type_key === "ANNUAL" && openingBalance > totalDays
            ? openingBalance - totalDays
            : 0;

        const newRemaining = openingBalance

        await this.repo.updateBalances(
          c,
          r.employee_number,
          r.leave_type_key,
          this.currentYear,
          {
            total_days: totalDays,
            carry_forward: carryForward,
            remaining_days: newRemaining,
          }
        );

        await this.repo.insertHistory(c, {
          employee_number: r.employee_number,
          leave_type_key: r.leave_type_key,
          action: "OPENING_BALANCE",

          days_changed: newRemaining - oldRemaining,

          old_total: totalDays,
          new_total: totalDays, // unchanged

          old_remaining: oldRemaining,
          new_remaining: newRemaining,

          reason: "Opening balance migration",
        });

        await this.repo.markOpeningBalanceApplied(
          c,
          r.employee_number,
          r.leave_type_key,
          this.currentYear
        );

        applied++;

        rowResults.push({
          ...r,
          import_status: "OK",
          message: "Opening balance applied",
          carry_forward: carryForward,
          entitlement_days: totalDays,
          previous_balance: oldRemaining,
          resulting_balance: newRemaining,
        });
      });
    }

    return {
      file_name: fileName,
      total_rows: rows.length,
      applied,
      skipped: rows.length - applied,
      row_results: rowResults,
      errors: [],
    };
  }

  async commitFromCsv(fileName: string, buffer: Buffer) {
    const rows = this.parseCsv(buffer);
    const { errors } = this.validator.validateRows(rows);

    if (errors.length) {
      throw new Error("CSV contains validation errors. Preview before commit.");
    }

    return this.commit(fileName, rows);
  }
}
