import { EntitlementRepository } from "../repositories/entitlementRepository";
import { CONFIG } from "../utils/config";
import { makeHttp } from "../utils/http";
import {
  DeductInput,
  DirectoryEmployee,
  EntitlementRow,
  LeaveTypeRow,
} from "../types/types";

import { buildHRFriendlyTimeline } from "../utils/entitlementTimeline";

export class EntitlementEngine {
  constructor(
    private repo = new EntitlementRepository(),
    private http = makeHttp()
  ) {}


  private async fetchActiveLeaveTypes(authHeader?: string) {
    const r = await this.http.get<{ leave_types: LeaveTypeRow[] }>(
      `${CONFIG.POLICY_SVC_URL}/internal/leave/leave-types`,
      { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
    );
    return r.data.leave_types.filter((t) => t.is_active !== false);
  }
  private async fetchActiveEmployeeNumbersInternal(): Promise<
    DirectoryEmployee[]
  > {
    const res = await this.http.get<{ employees: DirectoryEmployee[] }>(
      `${CONFIG.DIRECTORY_SVC_URL}/internal/employees/active`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
        },
      }
    );
    return res.data.employees;
  }

  private async fetchActiveEmployeesByCompanyInternal(
    companyKey: string
  ): Promise<DirectoryEmployee[]> {
    const res = await this.http.get<{ employees: DirectoryEmployee[] }>(
      `${
        CONFIG.DIRECTORY_SVC_URL
      }/internal/employees/active?company_key=${encodeURIComponent(
        companyKey
      )}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
        },
      }
    );
    return res.data.employees;
  }

  private async fetchEmployeeInternal(params: {
    employee_number?: string;
    email?: string;
  }) {
    if (!params.employee_number && !params.email) {
      throw new Error("employee_number or email is required");
    }

    const res = await this.http.get(
      `${CONFIG.DIRECTORY_SVC_URL}/internal/employees/employee`,
      {
        params,
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
        },
      }
    );

    if (!res.data?.employee_number) {
      throw new Error("Employee not found");
    }

    return res.data;
  }

  async myEntitlements(empNo: string, year: number) {
    return this.repo.getMyEntitlements(empNo, year);
  }

  async employeeEntitlements(empNo: string, year: number) {
    const rows = await this.repo.getEmployeeEntitlements(empNo, year);
    if (rows.length === 0)
      throw new Error("No entitlements found for employee");
    return rows;
  }

  async generateForAll1(authHeader?: string) {
    const year = new Date().getFullYear();
    const types = await this.fetchActiveLeaveTypes(authHeader);

    // Fetch employees
    const emps = await this.http.get<{ employees: DirectoryEmployee[] }>(
      `${CONFIG.DIRECTORY_SVC_URL}/internal/employees`,
      { headers: authHeader ? { Authorization: authHeader } : undefined }
    );

    let created = 0,
      skipped = 0;

    for (const emp of emps.data.employees) {
      for (const t of types) {
        const exists = await this.repo.entitlementExists(
          emp.employee_number,
          t.type_key,
          year
        );
        if (exists) {
          skipped++;
          continue;
        }
        await this.repo.insertEntitlement(
          emp.employee_number,
          t.type_key,
          year,
          t.default_days ?? 0
        );
        created++;
      }
    }

    return {
      message: "Entitlements generated successfully",
      created,
      skipped,
      year,
    };
  }
  async generateAll(companyKey?: string) {
    const year = new Date().getFullYear();

    const employees = companyKey
      ? await this.fetchActiveEmployeesByCompanyInternal(companyKey)
      : await this.fetchActiveEmployeeNumbersInternal();

    if (!employees.length) {
      return { message: "No active employees found" };
    }

    const leaveTypes = await this.fetchActiveLeaveTypes();

    console.log("Leave Types with Rules:", leaveTypes);

    if (!leaveTypes.length) {
      throw new Error("No leave types with rules found");
    }

    const employeeNumbers: string[] = [];
    const leaveTypeKeys: string[] = [];
    const years: number[] = [];
    const totalDays: number[] = [];
    const usedDays: number[] = [];
    const remainingDays: number[] = [];

    for (const emp of employees) {
      for (const type of leaveTypes) {
        employeeNumbers.push(emp.employee_number);
        leaveTypeKeys.push(type.type_key);
        years.push(year);
        totalDays.push(type.entitlement_days ?? 0);
        usedDays.push(0);
        remainingDays.push(type.entitlement_days ?? 0);
      }
    }

    const inserted = await this.repo.bulkInsertEntitlements(
      employeeNumbers,
      leaveTypeKeys,
      years,
      totalDays,
      usedDays,
      remainingDays
    );

    return {
      message: "Entitlements generated successfully",
      company_key: companyKey ?? "ALL",
      year,
      employees: employees.length,
      leave_types: leaveTypes.length,
      rows_attempted: employeeNumbers.length,
      rows_inserted: inserted,
    };
  }

  async generateForOne(employee_number: string) {
    const year = new Date().getFullYear();

    if (!employee_number || typeof employee_number !== "string") {
      throw new Error("employee_number is required");
    }

    const types = await this.fetchActiveLeaveTypes();
    const employee = await this.fetchEmployeeInternal({
      employee_number: employee_number,
    });
    if (!employee) {
      throw new Error(`Employee ${employee_number} not found`);
    }

    let created = 0;
    let skipped = 0;

    for (const t of types) {
      const exists = await this.repo.entitlementExists(
        employee_number,
        t.type_key,
        year
      );

      if (exists) {
        skipped++;
        continue;
      }

      await this.repo.insertEntitlement(
        employee_number,
        t.type_key,
        year,
        t.entitlement_days ?? 0
      );

      created++;
    }

    return {
      message: "Entitlements generated for employee",
      employee_number,
      created,
      skipped,
      year,
    };
  }

  async adjustLeaveBalance(
    empNo: string,
    key: string,
    days: number,
    reason?: string
  ) {
    const year = new Date().getFullYear();
    const normalized = key.trim().toUpperCase();

    return this.repo.withTx(async (c) => {
      const ent = await this.repo.lockEntitlement(c, empNo, normalized, year);
      if (!ent) throw new Error("Entitlement not found for current year");

      const oldRemaining = Number(ent.remaining_days);

      if (days === 0) {
        throw new Error("Adjustment days cannot be zero");
      }

      const newRemaining = oldRemaining + days;

      if (newRemaining < 0) {
        throw new Error("Resulting leave balance cannot be negative");
      }
      await this.repo.updateRemainingBalance(
        c,
        empNo,
        normalized,
        year,
        newRemaining
      );

      await this.repo.insertHistory(c, {
        employee_number: empNo,
        leave_type_key: normalized,
        action: "MANUAL_ADJUSTMENT",
        days_changed: days,

        old_total: Number(ent.total_days),
        new_total: Number(ent.total_days), // unchanged

        old_remaining: oldRemaining,
        new_remaining: newRemaining,

        reason: reason ?? "Manual balance adjustment",
      });

      return {
        message: "Leave balance adjusted successfully",
        employee_number: empNo,
        leave_type_key: normalized,
        year,
        adjustment: days,
        balances: {
          total_days: Number(ent.total_days),
          used_days: Number(ent.used_days),
          remaining_days: newRemaining,
        },
      };
    });
  }

  async deduct(input: DeductInput, authHeader?: string) {
    const emp = await this.fetchEmployeeInternal({ employee_number: input.employee_number });
    const year = new Date().getFullYear();
    const key = input.leave_type_key.trim().toUpperCase();

    const types = await this.fetchActiveLeaveTypes(authHeader);
    if (!types.find((t) => t.type_key === key))
      throw new Error("Leave type not found");

    return this.repo.withTx(async (c) => {
      const ent = await this.repo.lockEntitlement(
        c,
        emp.employee_number,
        key,
        year
      );
      if (!ent) throw new Error("Entitlement not found for current year");

      const oldTotal = Number(ent.total_days);
      const oldUsed = Number(ent.used_days);
      const oldRemaining = Number(ent.remaining_days);

      const newUsed = oldUsed + input.days;
      const newRemaining = oldRemaining - input.days; 

      if (newRemaining < CONFIG.NEGATIVE_BALANCE_FLOOR) {
        throw new Error(
          `Insufficient balance: minimum allowed is ${CONFIG.NEGATIVE_BALANCE_FLOOR} days`
        );
      }

      await this.repo.updateEntitlementUsed(
        c,
        emp.employee_number,
        key,
        year,
        newUsed,
        newRemaining
      );
      await this.repo.insertHistory(c, {
        employee_number: emp.employee_number,
        leave_type_key: key,
        action: "DEDUCT",
        days_changed: input.days,
        old_total: oldTotal,
        new_total: oldTotal,
        old_remaining: oldRemaining,
        new_remaining: newRemaining,
        reference_id: input.reference_id ?? null,
        reason: input.reason ?? null,
      });

      return {
        message: "Entitlement deducted successfully",
        employee_number: emp.employee_number,
        leave_type_key: key,
        year,
        totals: {
          total_days: oldTotal,
          used_days: newUsed,
          remaining_days: newRemaining,
        },
      };
    });
  }

  async recordCompOff(
    empNo: string,
    dateWorked: string,
    hours: number,
    earnedDays: number
  ) {
    await this.repo.insertCompOff(empNo, dateWorked, hours, earnedDays);
    return { message: "Comp-off entry recorded" };
  }

  async yearlyReset() {
    const year = new Date().getFullYear();
    await this.repo.yearlyReset(year);
    return { message: "Yearly reset done", year };
  }
  async getHistoryTimeline(
    employeeNumber: string,
    leaveTypeKey?: string,
    year?: number
  ) {
    const history = await this.repo.getHistory(
      employeeNumber,
      leaveTypeKey,
      year
    );

    return buildHRFriendlyTimeline(employeeNumber, history);
  }
}
