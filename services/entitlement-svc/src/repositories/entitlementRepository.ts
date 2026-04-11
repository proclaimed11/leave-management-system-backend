import { PoolClient } from "pg";
import { pool } from "../db/connection";
import { EntitlementRow } from "../types/types";

export class EntitlementRepository {
  async getMyEntitlements(employee_number: string, year: number) {
    const r = await pool.query(
      `SELECT leave_type_key, total_days, used_days, remaining_days, last_updated
       FROM entitlements
       WHERE employee_number = $1 AND year = $2
       ORDER BY leave_type_key ASC`,
      [employee_number, year]
    );
    return r.rows as EntitlementRow[];
  }

  async getEmployeeEntitlements(employee_number: string, year: number) {
    const r = await pool.query(
      `SELECT employee_number, leave_type_key, total_days, used_days, remaining_days, carry_forward, last_updated
       FROM entitlements
       WHERE employee_number = $1 AND year = $2
       ORDER BY leave_type_key ASC`,
      [employee_number, year]
    );
    return r.rows as EntitlementRow[];
  }
  async getEntitlement(empNo: string, typeKey: string, year: number) {
    const r = await pool.query(
      `
    SELECT *
    FROM entitlements
    WHERE employee_number = $1
      AND leave_type_key = $2
      AND year = $3
    LIMIT 1
    `,
      [empNo, typeKey, year]
    );

    return r.rows[0] ?? null;
  }

  async bulkInsertEntitlements(
    employeeNumbers: string[],
    leaveTypeKeys: string[],
    years: number[],
    totalDays: number[],
    usedDays: number[],
    remainingDays: number[]
  ): Promise<number> {
    const sql = `
    INSERT INTO entitlements (
      employee_number,
      leave_type_key,
      year,
      total_days,
      used_days,
      remaining_days
    )
    SELECT *
    FROM UNNEST (
      $1::varchar[],
      $2::varchar[],
      $3::int[],
      $4::int[],
      $5::int[],
      $6::int[]
    )
    ON CONFLICT (employee_number, leave_type_key, year)
    DO NOTHING
  `;

    const result = await pool.query(sql, [
      employeeNumbers,
      leaveTypeKeys,
      years,
      totalDays,
      usedDays,
      remainingDays,
    ]);

    return result.rowCount ?? 0;
  }

  async entitlementExists(empNo: string, typeKey: string, year: number) {
    const r = await pool.query(
      `SELECT 1 FROM entitlements
       WHERE employee_number = $1 AND leave_type_key = $2 AND year = $3
       LIMIT 1`,
      [empNo, typeKey, year]
    );
    return (r.rowCount ?? 0) > 0;
  }

  async insertEntitlement(
    empNo: string,
    typeKey: string,
    year: number,
    days: number
  ) {
    await pool.query(
      `INSERT INTO entitlements (
         employee_number, leave_type_key, year, total_days, used_days, remaining_days
       ) VALUES ($1,$2,$3,$4,0,$4)`,
      [empNo, typeKey, year, days]
    );
  }

  // ---------- transactional ops ----------
  async withTx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const out = await fn(client);
      await client.query("COMMIT");
      return out;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async lockEntitlement(
    c: PoolClient,
    empNo: string,
    key: string,
    year: number
  ) {
    const r = await c.query(
      `SELECT total_days, used_days, remaining_days, opening_balance_applied
       FROM entitlements
       WHERE employee_number = $1 AND leave_type_key = $2 AND year = $3
       FOR UPDATE`,
      [empNo, key, year]
    );
    return r.rows[0] as
      | {
          total_days: number;
          used_days: number;
          remaining_days: number;
          opening_balance_applied: boolean;
        }
      | undefined;
  }

  async updateEntitlementUsed(
    c: PoolClient,
    empNo: string,
    key: string,
    year: number,
    newUsed: number,
    newRemaining: number
  ) {
    await c.query(
      `UPDATE entitlements
       SET used_days = $1, remaining_days = $2, last_updated = NOW()
       WHERE employee_number = $3 AND leave_type_key = $4 AND year = $5`,
      [newUsed, newRemaining, empNo, key, year]
    );
  }

  async updateRemainingBalance(
    c: PoolClient,
    empNo: string,
    key: string,
    year: number,
    remaining: number
  ) {
    await c.query(
      `
    UPDATE entitlements
    SET remaining_days = $1,
        last_updated = NOW()
    WHERE employee_number = $2
      AND leave_type_key = $3
      AND year = $4
    `,
      [remaining, empNo, key, year]
    );
  }

  async updateBalances(
    c: PoolClient,
    empNo: string,
    typeKey: string,
    year: number,
    params: {
      total_days: number;
      carry_forward: number;
      remaining_days: number;
    }
  ) {
    const { total_days, carry_forward, remaining_days } = params;

    await c.query(
      `
    UPDATE entitlements
    SET
        total_days = $4,
        carry_forward = $5,
        remaining_days = $6,
        last_updated = NOW()
    WHERE employee_number = $1
      AND leave_type_key = $2
      AND year = $3
    `,
      [empNo, typeKey, year, total_days, carry_forward, remaining_days]
    );
  }

  async hasOpeningBalance(
    empNo: string,
    typeKey: string,
    year: number
  ): Promise<boolean> {
    const r = await pool.query(
      `
    SELECT 1
    FROM entitlement_history
    WHERE employee_number = $1
      AND leave_type_key = $2
      AND action = 'OPENING_BALANCE'
      AND EXTRACT(YEAR FROM created_at) = $3
    LIMIT 1
    `,
      [empNo, typeKey, year]
    );

    return r.rowCount! > 0;
  }
  async markOpeningBalanceApplied(
    c: PoolClient,
    employeeNumber: string,
    leaveTypeKey: string,
    year: number
  ) {
    await c.query(
      `UPDATE entitlements
     SET opening_balance_applied = TRUE
     WHERE employee_number = $1
       AND leave_type_key = $2
       AND year = $3`,
      [employeeNumber, leaveTypeKey, year]
    );
  }

  async insertHistory(
    c: PoolClient,
    params: {
      employee_number: string;
      leave_type_key: string;
      action:
        | "ADD"
        | "DEDUCT"
        | "RESET"
        | "OPENING_BALANCE"
        | "MANUAL_ADJUSTMENT";
      days_changed: number;
      old_total: number;
      new_total: number;
      old_remaining: number;
      new_remaining: number;
      reference_id?: string | null;
      reason?: string | null;
    }
  ) {
    const {
      employee_number,
      leave_type_key,
      action,
      days_changed,
      old_total,
      new_total,
      old_remaining,
      new_remaining,
      reference_id,
      reason,
    } = params;

    await c.query(
      `INSERT INTO entitlement_history (
         employee_number, leave_type_key, action, days_changed,
         old_total_days, new_total_days, old_remaining, new_remaining,
         reference_id, reason
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        employee_number,
        leave_type_key,
        action,
        days_changed,
        old_total,
        new_total,
        old_remaining,
        new_remaining,
        reference_id ?? null,
        reason ?? null,
      ]
    );
  }

  async insertCompOff(
    empNo: string,
    dateWorked: string,
    hours: number,
    earnedDays: number
  ) {
    await pool.query(
      `INSERT INTO comp_off_entries (employee_number, date_worked, hours_worked, earned_days)
       VALUES ($1,$2,$3,$4)`,
      [empNo, dateWorked, hours, earnedDays]
    );
  }

  async yearlyReset(year: number) {
    await pool.query(
      `INSERT INTO entitlement_yearly_reset (employee_number, leave_type_key, year, carried_forward)
       SELECT employee_number, leave_type_key, $1, remaining_days
       FROM entitlements`,
      [year]
    );

    await pool.query(
      `UPDATE entitlements
       SET used_days = 0,
           total_days = total_days + remaining_days,
           remaining_days = total_days + remaining_days,
           last_updated = NOW()`
    );
  }
  async getHistory(
    employeeNumber: string,
    leaveTypeKey?: string,
    year?: number
  ) {
    const params: any[] = [employeeNumber];
    let where = `WHERE employee_number = $1`;

    if (leaveTypeKey) {
      params.push(leaveTypeKey);
      where += ` AND leave_type_key = $${params.length}`;
    }

    if (year) {
      params.push(year);
      where += ` AND EXTRACT(YEAR FROM created_at) = $${params.length}`;
    }

    const r = await pool.query(
      `
    SELECT
      action,
      days_changed,
      leave_type_key,
      old_remaining,
      new_remaining,
      reason,
      reference_id,
      created_at
    FROM entitlement_history
    ${where}
    ORDER BY created_at ASC
    `,
      params
    );

    return r.rows;
  }
}
