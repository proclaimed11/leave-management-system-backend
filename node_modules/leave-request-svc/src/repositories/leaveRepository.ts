import { pool } from "../db/connection";
import { PoolClient } from "pg";
import { FindMineParams, LeaveRequestRow } from "../types/types";
import { CreateLeaveDraftInput } from "../types/draft";
import { calcDaysInclusive } from "../validators/leaveValidator";

export class LeaveRepository {
  async findById(id: number): Promise<LeaveRequestRow | null> {
    const r = await pool.query(`SELECT * FROM leave_requests WHERE id = $1`, [
      id,
    ]);
    return r.rows[0] || null;
  }

  async findByEmployeeNumber(
    employee_number: string,
    filters?: { status?: string },
  ): Promise<LeaveRequestRow[]> {
    const params: any[] = [employee_number];
    let q = `SELECT * FROM leave_requests WHERE employee_number = $1`;

    if (filters?.status) {
      params.push(filters.status);
      q += ` AND status = $${params.length}`;
    }

    q += ` ORDER BY created_at DESC`;
    const r = await pool.query(q, params);
    return r.rows;
  }

  async findOverlap(
    employee_number: string,
    start: string,
    end: string,
  ): Promise<boolean> {
    const r = await pool.query(
      `
    SELECT 1
    FROM leave_requests
    WHERE employee_number = $1
      AND status IN ('PENDING', 'APPROVED')
      AND start_date IS NOT NULL
      AND end_date IS NOT NULL
      AND start_date <= $3::date
      AND end_date >= $2::date
    LIMIT 1
    `,
      [employee_number, start, end],
    );

    return (r.rowCount ?? 0) > 0;
  }
  async findOverlapExcluding(
    employee_number: string,
    start: string,
    end: string,
    excludeRequestId: number,
  ): Promise<boolean> {
    const r = await pool.query(
      `
    SELECT 1
    FROM leave_requests
    WHERE employee_number = $1
      AND status IN ('PENDING', 'APPROVED')
      AND id != $4
      AND start_date IS NOT NULL
      AND end_date IS NOT NULL
      AND start_date <= $3::date
      AND end_date >= $2::date
    LIMIT 1
    `,
      [employee_number, start, end, excludeRequestId],
    );

    return (r.rowCount ?? 0) > 0;
  }

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
  async createLeave(
    c: PoolClient,
    request: {
      employee_number: string;
      company_key: string;
      leave_type_key: string;
      start_date: string;
      end_date: string;
      total_days: number;
      reason?: string | null;
      status?: string;
      handover_notes?: string | null;
      handover_to?: string | null;
    },
  ): Promise<LeaveRequestRow> {
    const r = await c.query(
      `
    INSERT INTO leave_requests (
      employee_number, company_key, leave_type_key, start_date, end_date, total_days,
      reason, status, handover_notes, handover_to
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
    `,
      [
        request.employee_number,
        request.company_key,
        request.leave_type_key,
        request.start_date,
        request.end_date,
        request.total_days,
        request.reason ?? null,
        request.status ?? "PENDING",
        request.handover_notes ?? null,
        request.handover_to ?? null,
      ],
    );

    return r.rows[0];
  }

  async leaveRequestExists(requestId: number): Promise<boolean> {
    const r = await pool.query(
      `SELECT 1 FROM leave_requests WHERE id = $1 LIMIT 1`,
      [requestId],
    );
    return (r.rowCount ?? 0) > 0;
  }

  async create(data: { request_id: number; file_url: string }) {
    const r = await pool.query(
      `
      INSERT INTO leave_attachments (request_id, file_url)
      VALUES ($1, $2)
      RETURNING id, request_id, file_url, uploaded_at
      `,
      [data.request_id, data.file_url],
    );
    return r.rows[0];
  }
  async listByRequest(requestId: number) {
    const r = await pool.query(
      `
      SELECT id, request_id, file_url, uploaded_at
      FROM leave_attachments
      WHERE request_id = $1
      ORDER BY uploaded_at ASC
      `,
      [requestId],
    );
    return r.rows;
  }
  async findMinePaginated(
    params: FindMineParams,
  ): Promise<{ total: number; requests: LeaveRequestRow[] }> {
    const { employee_number, limit, offset, status, search } = params;

    const filters: string[] = [`employee_number = $1`];
    const values: any[] = [employee_number];
    let idx = 2;

    if (status) {
      filters.push(`status = $${idx++}`);
      values.push(status);
    }

    if (search) {
      filters.push(`(leave_type_key ILIKE $${idx} OR reason ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM leave_requests ${whereClause}`,
      values,
    );

    const dataResult = await pool.query(
      `
      SELECT *
      FROM leave_requests
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `,
      [...values, limit, offset],
    );

    return {
      total: countResult.rows[0].total,
      requests: dataResult.rows,
    };
  }
  async updateLeaveRequestStatus(
    id: number,
    status: string,
  ): Promise<LeaveRequestRow> {
    const r = await pool.query(
      `
        UPDATE leave_requests
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `,
      [status, id],
    );
    return r.rows[0];
  }
  async getLeaveRequestById(requestId: number) {
    const r = await pool.query(
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
        handover_notes,
        handover_to,
        created_at
      FROM leave_requests
      WHERE id = $1
      `,
      [requestId],
    );

    return r.rows[0] ?? null;
  }
  async getApprovalTrail(requestId: number) {
    const r = await pool.query(
      `
      SELECT
        id,
        step_order,
        role,
        approver_emp_no,
        action,
        remarks,
        acted_at,
        created_at
      FROM leave_approvals
      WHERE request_id = $1
      ORDER BY step_order ASC
      `,
      [requestId],
    );

    return r.rows;
  }
  async getAttachments(requestId: number) {
    const r = await pool.query(
      `
      SELECT
        id,
        file_url,
        uploaded_at
      FROM leave_attachments
      WHERE request_id = $1
      ORDER BY uploaded_at DESC
      `,
      [requestId],
    );

    return r.rows;
  }
  async createDraft(
    c: PoolClient,
    input: CreateLeaveDraftInput,
  ): Promise<{ id: number }> {
    const totalDays = calcDaysInclusive(input.start_date, input.end_date);

    const r = await c.query(
      `
    INSERT INTO leave_requests (
      employee_number,
      leave_type_key,
      start_date,
      end_date,
      total_days,
      reason,
      status,
      source_plan_id,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', $7, NOW())
    RETURNING id
    `,
      [
        input.employee_number,
        input.leave_type_key,
        input.start_date,
        input.end_date,
        totalDays,
        input.reason ?? null,
        input.source_plan_id,
      ],
    );

    return r.rows[0];
  }
  async promoteDraftToPending(
    c: PoolClient,
    requestId: number,
    data: {
      total_days: number;
      handover_to: string;
      handover_notes?: string | null;
    },
  ): Promise<void> {
    await c.query(
      `
    UPDATE leave_requests
    SET status = 'PENDING',
        total_days = $2,
        handover_to = $3,
        handover_notes = $4,
        updated_at = NOW()
    WHERE id = $1
    `,
      [
        requestId,
        data.total_days,
        data.handover_to,
        data.handover_notes ?? null,
      ],
    );
  }
}
