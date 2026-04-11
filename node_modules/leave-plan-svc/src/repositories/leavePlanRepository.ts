import { PoolClient } from "pg";
import { pool } from "../db/connection";
import { LeavePlanRow, LeavePlanStatus } from "../types/types";

export class LeavePlanRepository {
  async create(
    employeeNumber: string,
    input: {
      leave_type_key: string;
      start_date: string;
      end_date: string;
      total_days: number;
      reason?: string | null;
    },
  ): Promise<LeavePlanRow> {
    const r = await pool.query<LeavePlanRow>(
      `
      INSERT INTO leave_plans (
        employee_number,
        leave_type_key,
        start_date,
        end_date,
        total_days,
        reason,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'PLANNED')
      RETURNING *
      `,
      [
        employeeNumber,
        input.leave_type_key,
        input.start_date,
        input.end_date,
        input.total_days,
        input.reason ?? null,
      ],
    );

    return r.rows[0];
  }

  async findById(id: number): Promise<LeavePlanRow | null> {
    const r = await pool.query<LeavePlanRow>(
      `SELECT * FROM leave_plans WHERE id = $1`,
      [id],
    );
    return r.rows[0] ?? null;
  }

  async listByEmployee(
    employeeNumber: string,
    options: {
      status?: LeavePlanStatus;
      year?: number;
      offset: number;
      limit: number;
    },
  ): Promise<{ rows: LeavePlanRow[]; total: number }> {
    const conditions: string[] = [`employee_number = $1`];
    const params: any[] = [employeeNumber];
    let idx = 2;

    if (options.status) {
      conditions.push(`status = $${idx++}`);
      params.push(options.status);
    }

    if (options.year) {
      conditions.push(`EXTRACT(YEAR FROM start_date) = $${idx++}`);
      params.push(options.year);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const totalRes = await pool.query<{ count: string }>(
      `
      SELECT COUNT(*)::int AS count
      FROM leave_plans
      ${where}
      `,
      params,
    );

    const dataRes = await pool.query<LeavePlanRow>(
      `
      SELECT *
      FROM leave_plans
      ${where}
      ORDER BY start_date ASC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...params, options.limit, options.offset],
    );

    return {
      total: Number(totalRes.rows[0]?.count ?? 0),
      rows: dataRes.rows,
    };
  }

  async update(
    id: number,
    employeeNumber: string,
    input: {
      start_date?: string;
      end_date?: string;
      total_days?: number;
      reason?: string | null;
    },
  ): Promise<LeavePlanRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (input.start_date) {
      fields.push(`start_date = $${idx++}`);
      values.push(input.start_date);
    }
    if (input.end_date) {
      fields.push(`end_date = $${idx++}`);
      values.push(input.end_date);
    }
    if (input.total_days !== undefined) {
      fields.push(`total_days = $${idx++}`);
      values.push(input.total_days);
    }
    if (input.reason !== undefined) {
      fields.push(`reason = $${idx++}`);
      values.push(input.reason);
    }

    if (!fields.length) return null;

    const r = await pool.query<LeavePlanRow>(
      `
      UPDATE leave_plans
      SET ${fields.join(", ")},
          updated_at = NOW()
      WHERE id = $${idx} 
        AND employee_number = $${idx + 1}
        AND status = 'PLANNED'
      RETURNING *
      `,
      [...values, id, employeeNumber],
    );

    return r.rows[0] ?? null;
  }

  async cancel(
    id: number,
    employeeNumber: string,
  ): Promise<LeavePlanRow | null> {
    const r = await pool.query<LeavePlanRow>(
      `
      UPDATE leave_plans
      SET status = 'CANCELLED',
          updated_at = NOW()
      WHERE id = $1
        AND employee_number = $2
        AND status = 'PLANNED'
      RETURNING *
      `,
      [id, employeeNumber],
    );

    return r.rows[0] ?? null;
  }

async markConverted(
  c: PoolClient,
  planId: number,
  leaveRequestId: number,
): Promise<void> {
  const r = await c.query(
    `
    UPDATE leave_plans
    SET status = 'CONVERTED',
        converted_leave_request_id = $2,
        updated_at = NOW()
    WHERE id = $1
      AND converted_leave_request_id IS NULL
    `,
    [planId, leaveRequestId],
  );

  if (r.rowCount === 0) {
    throw new Error("Leave plan already converted");
  }
}


  async hasOverlap(
    employeeNumber: string,
    startDate: string,
    endDate: string,
  ): Promise<boolean> {
    const r = await pool.query(
      `
      SELECT 1
      FROM leave_plans
      WHERE employee_number = $1
        AND status = 'PLANNED'
        AND daterange(start_date, end_date, '[]')
            && daterange($2::date, $3::date, '[]')
      LIMIT 1
      `,
      [employeeNumber, startDate, endDate],
    );

    return (r.rowCount ?? 0) > 0;
  }
  async withTx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const res = await fn(client);
      await client.query("COMMIT");
      return res;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
  async listPlansForEmployees(
    employeeNumbers: string[],
    statuses: string[],
    offset: number,
    limit: number,
  ): Promise<{ rows: LeavePlanRow[]; total: number }> {
    if (!employeeNumbers.length) {
      return { rows: [], total: 0 };
    }

    const totalRes = await pool.query<{ count: number }>(
      `
      SELECT COUNT(*)::int AS count
      FROM leave_plans
      WHERE employee_number = ANY($1)
        AND status = ANY($2)
      `,
      [employeeNumbers, statuses],
    );

    const dataRes = await pool.query<LeavePlanRow>(
      `
      SELECT
        id,
        employee_number,
        leave_type_key,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        created_at
      FROM leave_plans
      WHERE employee_number = ANY($1)
        AND status = ANY($2)
      ORDER BY start_date ASC
      LIMIT $3 OFFSET $4
      `,
      [employeeNumbers, statuses, limit, offset],
    );

    return {
      rows: dataRes.rows,
      total: totalRes.rows[0]?.count ?? 0,
    };
  }
}
