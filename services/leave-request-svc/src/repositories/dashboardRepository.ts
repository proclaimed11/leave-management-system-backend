import { pool } from "../db/connection";
import {
  LeaveRequestRow,
  PendingApprovalCardRow,
  TeamLeaveRow,
} from "../types/dashboard";

export class DashboardRepository {
  async countPending(employeeNumber: string): Promise<number> {
    const r = await pool.query(
      `SELECT COUNT(*)::int AS cnt
       FROM leave_requests
       WHERE employee_number = $1 AND status = 'PENDING'`,
      [employeeNumber],
    );
    return r.rows[0]?.cnt ?? 0;
  }

  async countApprovedThisYear(
    employeeNumber: string,
    year: number,
  ): Promise<number> {
    const r = await pool.query(
      `SELECT COUNT(*)::int AS cnt
       FROM leave_requests
       WHERE employee_number = $1
         AND status = 'APPROVED'
         AND EXTRACT(YEAR FROM start_date) = $2`,
      [employeeNumber, year],
    );
    return r.rows[0]?.cnt ?? 0;
  }

  async listLatestRequests(
    employeeNumber: string,
    limit = 5,
  ): Promise<LeaveRequestRow[]> {
    const r = await pool.query(
      `SELECT id, employee_number, leave_type_key, start_date, end_date,
              total_days, status, created_at
       FROM leave_requests
       WHERE employee_number = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [employeeNumber, limit],
    );
    return r.rows;
  }

  async countPendingApprovalsForApprover(
    approverEmpNo: string,
  ): Promise<number> {
    const r = await pool.query<{ cnt: number }>(
      `
      SELECT COUNT(*)::int AS cnt
      FROM leave_approvals la
      WHERE la.action = 'PENDING'
        AND la.approver_emp_no = $1
        AND NOT EXISTS (
          SELECT 1
          FROM leave_approvals prev
          WHERE prev.request_id = la.request_id
            AND prev.step_order < la.step_order
            AND prev.action <> 'APPROVED'
        )
      `,
      [approverEmpNo],
    );

    return r.rows[0]?.cnt ?? 0;
  }

  async listPendingApprovalCardsForApprover(
    approverEmpNo: string,
    limit = 5,
  ): Promise<PendingApprovalCardRow[]> {
    const r = await pool.query<PendingApprovalCardRow>(
      `
      SELECT
        la.id              AS approval_id,
        la.request_id      AS request_id,
        la.step_order      AS step_order,
        la.role            AS approver_role,
        la.approver_emp_no AS approver_emp_no,

        lr.employee_number AS requester_emp_no,
        lr.leave_type_key  AS leave_type_key,
        lr.start_date::text AS start_date,
        lr.end_date::text   AS end_date,
        lr.total_days      AS total_days,
        lr.reason          AS reason,
        lr.created_at::text AS applied_at
      FROM leave_approvals la
      JOIN leave_requests lr ON lr.id = la.request_id
      WHERE la.action = 'PENDING'
        AND la.approver_emp_no = $1
        AND NOT EXISTS (
          SELECT 1
          FROM leave_approvals prev
          WHERE prev.request_id = la.request_id
            AND prev.step_order < la.step_order
            AND prev.action <> 'APPROVED'
        )
      ORDER BY lr.created_at DESC
      LIMIT $2
      `,
      [approverEmpNo, limit],
    );

    return r.rows;
  }

  async countOnLeaveTodayForEmployees(
    employeeNumbers: string[],
  ): Promise<number> {
    if (!employeeNumbers.length) return 0;

    const r = await pool.query<{ cnt: number }>(
      `
      SELECT COUNT(DISTINCT lr.employee_number)::int AS cnt
      FROM leave_requests lr
      WHERE lr.status = 'APPROVED'
        AND lr.employee_number = ANY($1::text[])
        AND CURRENT_DATE BETWEEN lr.start_date::date AND lr.end_date::date
      `,
      [employeeNumbers],
    );

    return r.rows[0]?.cnt ?? 0;
  }

  async sumApprovedLeaveDaysThisMonthForEmployees(
    employeeNumbers: string[],
  ): Promise<number> {
    if (!employeeNumbers.length) return 0;

    const r = await pool.query<{ used_days: number }>(
      `
      SELECT COALESCE(SUM(lr.total_days), 0)::int AS used_days
      FROM leave_requests lr
      WHERE lr.status = 'APPROVED'
        AND lr.employee_number = ANY($1::text[])
        AND date_trunc('month', lr.start_date::date) = date_trunc('month', CURRENT_DATE)
      `,
      [employeeNumbers],
    );

    return r.rows[0]?.used_days ?? 0;
  }
  async listTeamLeaves(
    employeeNumbers: string[],
    offset: number,
    limit: number,
    status?: string,
  ): Promise<{ rows: TeamLeaveRow[]; total: number }> {
    if (employeeNumbers.length === 0) {
      return { rows: [], total: 0 };
    }

    const params: any[] = [employeeNumbers];
    let statusFilter = "";

    if (status) {
      params.push(status);
      statusFilter = `AND lr.status = $2`;
    }

    const totalRes = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM leave_requests lr
      WHERE lr.employee_number = ANY($1)
      ${statusFilter}
      `,
      params,
    );

    params.push(limit, offset);

    const dataRes = await pool.query(
      `
      SELECT
        lr.id AS request_id,
        lr.employee_number,
        lr.leave_type_key,
        lr.start_date,
        lr.end_date,
        lr.total_days,
        lr.status,
        lr.created_at
      FROM leave_requests lr
      WHERE lr.employee_number = ANY($1)
      ${statusFilter}
      ORDER BY lr.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
      `,
      params,
    );

    return {
      rows: dataRes.rows,
      total: Number(totalRes.rows[0].count),
    };
  }
  async countCompanyPendingRequests(): Promise<number> {
    const r = await pool.query<{ cnt: number }>(
      `
      SELECT COUNT(*)::int AS cnt
      FROM leave_requests
      WHERE status = 'PENDING'
      `,
    );
    return r.rows[0]?.cnt ?? 0;
  }

  async countOpenDisputes(): Promise<number> {
    // Placeholder – future feature
    return 0;
  }

  async getLeaveTypeDistribution(): Promise<
    { leave_type_key: string; count: number }[]
  > {
    const r = await pool.query<{ leave_type_key: string; count: number }>(
      `
      SELECT leave_type_key, COUNT(*)::int AS count
      FROM leave_requests
      WHERE status = 'APPROVED'
      GROUP BY leave_type_key
      `,
    );
    return r.rows;
  }

  async getEmployeesOnLeaveToday(): Promise<
    { employee_number: string; count: number }[]
  > {
    const r = await pool.query<{ employee_number: string; count: number }>(
      `
      SELECT lr.employee_number, COUNT(*)::int AS count
      FROM leave_requests lr
      WHERE lr.status = 'APPROVED'
        AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
      GROUP BY lr.employee_number
      `,
    );
    return r.rows;
  }
  async getApprovedLeaveEmployeeNumbers(): Promise<string[]> {
    const r = await pool.query<{ employee_number: string }>(
      `
    SELECT DISTINCT lr.employee_number
    FROM leave_requests lr
    WHERE lr.status = 'APPROVED'
    `,
    );
    return r.rows.map((x) => x.employee_number);
  }

  async getHrFinalApprovalQueue(limit = 5): Promise<
    {
      request_id: number;
      employee_number: string;
      leave_type_key: string;
      start_date: string;
      end_date: string;
      total_days: number;
      created_at: string;
      supervisor_emp_no: string | null;
    }[]
  > {
    const r = await pool.query(
      `
      SELECT
        lr.id AS request_id,
        lr.employee_number,
        lr.leave_type_key,
        lr.start_date,
        lr.end_date,
        lr.total_days,
        lr.created_at,

        (
          SELECT la2.approver_emp_no
          FROM leave_approvals la2
          WHERE la2.request_id = lr.id
            AND la2.step_order = 1
            AND la2.action = 'APPROVED'
          LIMIT 1
        ) AS supervisor_emp_no

      FROM leave_requests lr
      JOIN leave_approvals la
        ON la.request_id = lr.id

      WHERE la.role = 'hr'
        AND la.action = 'PENDING'
        AND NOT EXISTS (
          SELECT 1
          FROM leave_approvals prev
          WHERE prev.request_id = la.request_id
            AND prev.step_order < la.step_order
            AND prev.action <> 'APPROVED'
        )

      ORDER BY lr.created_at DESC
      LIMIT $1
      `,
      [limit],
    );

    return r.rows;
  }
}
