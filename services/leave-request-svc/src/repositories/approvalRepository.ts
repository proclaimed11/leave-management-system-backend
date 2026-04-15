import { PoolClient } from "pg";
import { pool } from "../db/connection";
import {
  BuiltWorkflowStep,
  ApprovalAction,
  EmployeeRole,
  ApprovalHistoryRow,
  PaginatedApprovals,
} from "../types/approval";

export class ApprovalRepository {
  async insertWorkflowSteps(
    requestId: number,
    steps: BuiltWorkflowStep[],
    c: PoolClient,
  ): Promise<void> {
    for (const step of steps) {
      await c.query(
        `
        INSERT INTO leave_approvals
          (request_id, step_order, role, approver_emp_no, action)
        VALUES
          ($1, $2, $3, $4, 'PENDING')
        `,
        [requestId, step.step_order, step.role, step.approver_emp_no],
      );
    }
  }

  async getCurrentPendingStep(requestId: number) {
    const r = await pool.query(
      `
      SELECT *
      FROM leave_approvals
      WHERE request_id = $1
        AND action = 'PENDING'
      ORDER BY step_order
      LIMIT 1
      `,
      [requestId],
    );

    return r.rows[0] || null;
  }

  async listByRequest(requestId: number) {
    const r = await pool.query(
      `
      SELECT *
      FROM leave_approvals
      WHERE request_id = $1
      ORDER BY step_order ASC
      `,
      [requestId],
    );

    return r.rows;
  }

  async actOnStep(params: {
    step_id: number;
    actor_emp_no: string;
    action: Exclude<ApprovalAction, "PENDING">;
    remarks?: string;
  }) {
    const { step_id, actor_emp_no, action, remarks } = params;

    const r = await pool.query(
      `
      UPDATE leave_approvals
      SET
        action = $1,
        remarks = $2,
        acted_at = NOW(),
        approver_emp_no = COALESCE(approver_emp_no, $3)
      WHERE id = $4
      RETURNING *
      `,
      [action, remarks ?? null, actor_emp_no, step_id],
    );

    return r.rows[0];
  }

  async hasPendingSteps(requestId: number): Promise<boolean> {
    const r = await pool.query(
      `
      SELECT 1
      FROM leave_approvals
      WHERE request_id = $1
        AND action = 'PENDING'
      LIMIT 1
      `,
      [requestId],
    );

    return (r.rowCount ?? 0) > 0;
  }

  async getApprovalHistoryForEmployee(
    employeeNumber: string,
    role: EmployeeRole,
    page = 1,
    pageSize = 25,
    options?: {
      action?: "APPROVED" | "REJECTED" | "PENDING";
      search?: string;
    },
  ): Promise<PaginatedApprovals<ApprovalHistoryRow>> {
    const offset = (page - 1) * pageSize;

    const actionFilter = options?.action ?? null;
    const search = options?.search?.trim()
      ? `%${options!.search!.trim()}%`
      : null;

    const involvedSql = `
      SELECT DISTINCT la0.request_id
      FROM leave_approvals la0
      INNER JOIN leave_requests lr0 ON lr0.id = la0.request_id
      WHERE
        (la0.approver_emp_no = $1 AND la0.action IN ('APPROVED', 'REJECTED'))
        OR (
          la0.action = 'PENDING' AND lr0.status = 'PENDING'
          AND (
            (la0.approver_emp_no IS NOT NULL AND la0.approver_emp_no = $1)
            OR (
              la0.approver_emp_no IS NULL
              AND LOWER(TRIM(la0.role::text)) = LOWER(TRIM($2::text))
            )
          )
        )
    `;

    const listFilters = `
      lr.id IN (${involvedSql})
      AND ($3::text IS NULL OR la.action::text = $3::text)
      AND (
        $4::text IS NULL
        OR lr.employee_number ILIKE $4
        OR lr.leave_type_key ILIKE $4
      )
    `;

    const totalRes = await pool.query<{ count: string }>(
      `
      SELECT COUNT(DISTINCT lr.id)::text AS count
      FROM leave_approvals la
      INNER JOIN leave_requests lr ON lr.id = la.request_id
      WHERE ${listFilters}
      `,
      [employeeNumber, role, actionFilter, search],
    );

    const dataRes = await pool.query<ApprovalHistoryRow>(
      `
      SELECT DISTINCT ON (lr.id)
        la.id              AS approval_id,
        la.request_id      AS request_id,
        la.step_order      AS step_order,
        la.role            AS role,
        la.approver_emp_no AS approver_emp_no,
        la.action          AS action,
        la.remarks         AS remarks,
        la.acted_at        AS acted_at,
        lr.employee_number AS requester_emp_no,
        lr.leave_type_key  AS leave_type_key,
        lr.start_date      AS start_date,
        lr.end_date        AS end_date,
        lr.total_days      AS total_days,
        lr.reason          AS reason,
        lr.created_at      AS applied_at
      FROM leave_approvals la
      INNER JOIN leave_requests lr ON lr.id = la.request_id
      WHERE ${listFilters}
      ORDER BY
        lr.id,
        CASE
          WHEN LOWER(TRIM(la.role::text)) = LOWER(TRIM($2::text)) THEN 0
          ELSE 1
        END,
        CASE
          WHEN $3::text IS NOT NULL AND la.action::text = $3::text THEN 0
          ELSE 1
        END,
        CASE
          WHEN la.action::text = 'PENDING' THEN 0
          WHEN la.action::text = 'REJECTED' THEN 1
          ELSE 2
        END,
        la.step_order ASC,
        COALESCE(la.acted_at, la.created_at) DESC NULLS LAST
      LIMIT $5 OFFSET $6
      `,
      [employeeNumber, role, actionFilter, search, pageSize, offset],
    );

    return {
      total: Number(totalRes.rows[0]?.count ?? 0),
      items: dataRes.rows,
    };
  }

  async hasRejection(requestId: number): Promise<boolean> {
    const r = await pool.query(
      `
      SELECT 1
      FROM leave_approvals
      WHERE request_id = $1
        AND action = 'REJECTED'
      LIMIT 1
      `,
      [requestId],
    );

    return (r.rowCount ?? 0) > 0;
  }
}
