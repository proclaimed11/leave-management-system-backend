import { pool } from "../db/connection";
import { PoolClient } from "pg";
import {
  HandoverRecord,
  HandoverTask,
  CreateTaskPayload,
  UpdateTaskStatusPayload,
  HandoverRow,
  HandoverTaskRow,
  HandoverCard,
  HandoverDetail,
} from "../types/types";

export class HandoverRepository {
  async createHandover(
    requestId: number,
    handoverTo: string | null,
    notes: string | null,
    documentUrl: string | null,
    c?: PoolClient
  ): Promise<HandoverRecord> {
    const client = c || pool;
    const r = await client.query(
      `
      INSERT INTO leave_handover (request_id, handover_to, notes, document_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [requestId, handoverTo, notes ?? null, documentUrl ?? null]
    );
    return r.rows[0];
  }

  async getHandoverByRequest(
    requestId: number
  ): Promise<HandoverRecord | null> {
    const r = await pool.query(
      `SELECT * FROM leave_handover WHERE request_id = $1`,
      [requestId]
    );
    return r.rows[0] || null;
  }
  async findTasksAssignedTo(employee_number: string): Promise<
    {
      handover: HandoverRow;
      tasks: HandoverTaskRow[];
    }[]
  > {
    const r = await pool.query(
      `
      SELECT 
        h.id AS handover_id,
        h.request_id,
        h.handover_to,
        h.notes,
        h.document_url,
        h.created_at AS handover_created_at,
        h.updated_at AS handover_updated_at,
        t.id AS task_id,
        t.title,
        t.is_completed,
        t.order_index,
        t.completed_at,
        t.updated_by,
        t.created_at AS task_created_at,
        t.updated_at AS task_updated_at
      FROM leave_handover h
      LEFT JOIN leave_handover_tasks t
        ON t.handover_id = h.id
      WHERE h.handover_to = $1
      ORDER BY h.created_at DESC, t.order_index ASC
      `,
      [employee_number]
    );

    const map = new Map<
      number,
      { handover: HandoverRow; tasks: HandoverTaskRow[] }
    >();

    for (const row of r.rows) {
      if (!map.has(row.handover_id)) {
        map.set(row.handover_id, {
          handover: {
            id: row.handover_id,
            request_id: row.request_id,
            handover_to: row.handover_to,
            notes: row.notes,
            document_url: row.document_url,
            created_at: row.handover_created_at,
            updated_at: row.handover_updated_at,
          },
          tasks: [],
        });
      }

      if (row.task_id) {
        map.get(row.handover_id)!.tasks.push({
          id: row.task_id,
          handover_id: row.handover_id,
          title: row.title,
          is_completed: row.is_completed,
          order_index: row.order_index,
          completed_at: row.completed_at,
          updated_by: row.updated_by,
          created_at: row.task_created_at,
          updated_at: row.task_updated_at,
        });
      }
    }

    return Array.from(map.values());
  }

  async createTask(
    handoverId: number,
    payload: CreateTaskPayload,
    c?: PoolClient
  ): Promise<HandoverTask> {
    const client = c || pool;
    const r = await client.query(
      `
      INSERT INTO leave_handover_tasks (handover_id, title, order_index)
      VALUES ($1, $2, COALESCE($3, 0))
      RETURNING *
      `,
      [handoverId, payload.title, payload.order_index ?? 0]
    );
    return r.rows[0];
  }

  async getTasks(handoverId: number): Promise<HandoverTask[]> {
    const r = await pool.query(
      `
      SELECT *
      FROM leave_handover_tasks
      WHERE handover_id = $1
      ORDER BY order_index ASC, id ASC
      `,
      [handoverId]
    );
    return r.rows;
  }

  async updateTaskStatus(
    taskId: number,
    payload: UpdateTaskStatusPayload
  ): Promise<HandoverTask | null> {
    const { is_completed, updated_by } = payload;
    const r = await pool.query(
      `
      UPDATE leave_handover_tasks
      SET
        is_completed = $1,
        completed_at = CASE WHEN $1 = TRUE THEN NOW() ELSE NULL END,
        updated_by = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [is_completed, updated_by, taskId]
    );
    return r.rows[0] || null;
  }
  async findTaskById(taskId: number): Promise<HandoverTaskRow | null> {
    const r = await pool.query(
      `
      SELECT *
      FROM leave_handover_tasks
      WHERE id = $1
      `,
      [taskId]
    );
    return r.rows[0] || null;
  }
  async findHandoverById(handoverId: number) {
    const r = await pool.query(`SELECT * FROM leave_handover WHERE id = $1`, [
      handoverId,
    ]);
    return r.rows[0] || null;
  }
  async markTaskCompleted(
    taskId: number,
    employee_number: string
  ): Promise<HandoverTaskRow> {
    const r = await pool.query(
       `
    UPDATE leave_handover_tasks t
    SET
      is_completed = true,
      completed_at = NOW(),
      updated_by = $2,
      updated_at = NOW()
    FROM leave_handover h
    JOIN leave_requests lr ON lr.id = h.request_id
    WHERE t.id = $1
      AND t.handover_id = h.id
      AND h.handover_to = $2
      AND t.is_completed = false
    RETURNING t.id
    `,
    [taskId, employee_number]
    );

    return r.rows[0];
  }
  async findReceivedHandovers(params: {
    employee_number: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: any[]; total: number }> {
    const filters = ["h.handover_to = $1"];
    const values: any[] = [params.employee_number];

    if (params.status) {
      values.push(params.status);
      filters.push(`lr.status = $${values.length}`);
    }

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    const dataQuery = `
    SELECT
      h.id AS handover_id,
      h.request_id,
      h.created_at,

      lr.employee_number AS assigned_by_employee_number,
      lr.leave_type_key,
      lr.start_date,
      lr.end_date,
      lr.status AS leave_status,

      COUNT(t.id)::int AS tasks_assigned

    FROM leave_handover h
    JOIN leave_requests lr ON lr.id = h.request_id
    LEFT JOIN leave_handover_tasks t ON t.handover_id = h.id

    ${whereClause}
    GROUP BY h.id, lr.id
    ORDER BY h.created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

    const countQuery = `
    SELECT COUNT(DISTINCT h.id) AS total
    FROM leave_handover h
    JOIN leave_requests lr ON lr.id = h.request_id
    ${whereClause}
  `;

    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, [...values, params.limit, params.offset]),
      pool.query(countQuery, values),
    ]);

    return {
      rows: dataRes.rows,
      total: Number(countRes.rows[0]?.total ?? 0),
    };
  }
  async findHandoverDetails(
  handoverId: number,
  employeeNumber: string
): Promise<HandoverDetail | null> {

  const r = await pool.query(
    `
    SELECT
      h.id AS handover_id,
      h.request_id,
      h.notes AS handover_notes,
      h.document_url,
      h.created_at,

      lr.employee_number AS assigned_by_employee_number,
      lr.leave_type_key,
      lr.start_date,
      lr.end_date,
      lr.status AS leave_status,

      t.id AS task_id,
      t.title,
      t.is_completed,
      t.completed_at,
      t.updated_by,
      t.order_index

    FROM leave_handover h
    JOIN leave_requests lr ON lr.id = h.request_id
    LEFT JOIN leave_handover_tasks t ON t.handover_id = h.id
    WHERE h.id = $1
      AND h.handover_to = $2
    ORDER BY t.order_index ASC
    `,
    [handoverId, employeeNumber]
  );

  if (r.rowCount === 0) return null;

  const first = r.rows[0];

  return {
    handover_id: first.handover_id,
    request_id: first.request_id,

    leave_type_key: first.leave_type_key,
    start_date: first.start_date,
    end_date: first.end_date,
    leave_status: first.leave_status,

    assigned_by_employee_number: first.assigned_by_employee_number,

    handover_notes: first.handover_notes,
    document_url: first.document_url,

    created_at: first.created_at,

    tasks: r.rows
      .filter(row => row.task_id)
      .map(row => ({
        id: row.task_id,
        title: row.title,
        is_completed: row.is_completed,
        completed_at: row.completed_at,
        updated_by: row.updated_by,
        order_index: row.order_index,
      })),
  };
}

}
