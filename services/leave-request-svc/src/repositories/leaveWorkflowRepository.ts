import { PoolClient } from "pg";
import { pool } from "../db/connection";
import {
  WorkflowStep,
  UpdateApprovalInput,
  EmployeeRole,
  PendingApprovalRow,
  PaginatedApprovals,
  LeaveApproval,
} from "../types/types";

export class LeaveWorkflowRepository {

  async insertWorkflowSteps(
    requestId: number,
    steps: WorkflowStep[],
    client?: PoolClient
  ): Promise<void> {
    const c = client ?? pool;

    if (!steps.length) {
      throw new Error("Workflow must have at least one step");
    }

    await c.query(`DELETE FROM leave_approvals WHERE request_id = $1`, [
      requestId,
    ]);

    const values: any[] = [];
    const placeholders: string[] = [];

    steps.forEach((step, i) => {
      const o = i * 5;
      placeholders.push(
        `($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4}, $${o + 5})`
      );
      values.push(
        requestId,
        step.step_order,
        step.role,
        step.approver_emp_no,
        step.action
      );
    });

    await c.query(
      `
      INSERT INTO leave_approvals
        (request_id, step_order, role, approver_emp_no, action)
      VALUES ${placeholders.join(", ")}
      `,
      values
    );
  }


  async getApprovalsByRequestId(requestId: number): Promise<LeaveApproval[]> {
    const r = await pool.query<LeaveApproval>(
      `
      SELECT *
      FROM leave_approvals
      WHERE request_id = $1
      ORDER BY step_order ASC
      `,
      [requestId]
    );

    return r.rows;
  }

  /**
   * All pending workflow rows for an in-flight leave (HR and HOD may act in parallel).
   */
  async getPendingStepsForRequest(requestId: number): Promise<LeaveApproval[]> {
    const r = await pool.query<LeaveApproval>(
      `
      SELECT la.*
      FROM leave_approvals la
      INNER JOIN leave_requests lr ON lr.id = la.request_id
      WHERE la.request_id = $1
        AND la.action = 'PENDING'
        AND lr.status = 'PENDING'
      ORDER BY la.step_order ASC
      `,
      [requestId],
    );
    return r.rows;
  }

  async canEmployeeApprove(
    requestId: number,
    stepOrder: number,
    employeeNumber: string,
    employeeRole: EmployeeRole,
  ): Promise<boolean> {
    const r = await pool.query(
      `
      SELECT 1
      FROM leave_approvals la
      WHERE la.request_id = $1
        AND la.step_order = $2
        AND la.action = 'PENDING'
        AND (
          (la.approver_emp_no IS NOT NULL AND la.approver_emp_no = $3)
          OR (
            la.approver_emp_no IS NULL
            AND LOWER(TRIM(la.role::text)) = LOWER(TRIM($4::text))
          )
        )
      `,
      [requestId, stepOrder, employeeNumber, employeeRole],
    );

    return r.rowCount === 1;
  }

  /** When one approver rejects, close remaining pending steps for the same request. */
  async cancelOtherPendingSteps(
    requestId: number,
    exceptStepOrder: number,
    actorEmployeeNumber: string,
  ): Promise<void> {
    await pool.query(
      `
      UPDATE leave_approvals
      SET
        action = 'REJECTED',
        approver_emp_no = $2,
        remarks = $4,
        acted_at = NOW()
      WHERE request_id = $1
        AND action = 'PENDING'
        AND step_order <> $3
      `,
      [
        requestId,
        actorEmployeeNumber,
        exceptStepOrder,
        "Closed: another approver rejected this leave request.",
      ],
    );
  }



  async updateApprovalStep(
    requestId: number,
    stepOrder: number,
    input: UpdateApprovalInput
  ): Promise<void> {
    await pool.query(
      `
      UPDATE leave_approvals
      SET
        action = $1,
        approver_emp_no = $2,
        remarks = $3,
        acted_at = NOW()
      WHERE request_id = $4
        AND step_order = $5
      `,
      [
        input.action,
        input.approver_emp_no,
        input.remarks ?? null,
        requestId,
        stepOrder,
      ]
    );
  }


async getPendingApprovalsForEmployee(
  employeeNumber: string,
  role: EmployeeRole,
  page = 1,
  pageSize = 20,
): Promise<PaginatedApprovals<PendingApprovalRow>> {
  const offset = (page - 1) * pageSize;

  const stepMatch = `
    (
      (la.approver_emp_no IS NOT NULL AND la.approver_emp_no = $1)
      OR (
        la.approver_emp_no IS NULL
        AND LOWER(TRIM(la.role::text)) = LOWER(TRIM($2::text))
      )
    )
  `;

  const totalRes = await pool.query<{ count: string }>(
    `
    SELECT COUNT(*)::text AS count
    FROM leave_approvals la
    JOIN leave_requests lr ON lr.id = la.request_id
    WHERE la.action = 'PENDING'
      AND lr.status = 'PENDING'
      AND ${stepMatch}
    `,
    [employeeNumber, role],
  );

  const dataRes = await pool.query<PendingApprovalRow>(
    `
    SELECT
      la.id                AS approval_id,
      la.request_id        AS request_id,
      la.step_order        AS step_order,
      la.role              AS role,
      la.approver_emp_no   AS approver_emp_no,

      lr.employee_number   AS requester_emp_no,
      lr.leave_type_key    AS leave_type_key,
      lr.start_date        AS start_date,
      lr.end_date          AS end_date,
      lr.total_days        AS total_days,
      lr.reason            AS reason,
      lr.created_at        AS applied_at
    FROM leave_approvals la
    JOIN leave_requests lr ON lr.id = la.request_id
    WHERE la.action = 'PENDING'
      AND lr.status = 'PENDING'
      AND ${stepMatch}
    ORDER BY la.created_at ASC
    LIMIT $3 OFFSET $4
    `,
    [employeeNumber, role, pageSize, offset],
  );

  return {
    total: Number(totalRes.rows[0]?.count ?? 0),
    items: dataRes.rows,
  };
}
async hasPendingSteps(requestId: number): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM leave_approvals
      WHERE request_id = $1
        AND action = 'PENDING'
    ) AS exists
    `,
    [requestId]
  );

  return result.rows[0]?.exists ?? false;
}

}
