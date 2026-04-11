// src/repositories/leaveRuleRepository.ts

import { pool } from "../db/connection";
import {
  LeaveRule,
  CreateLeaveRuleInput,
  UpdateLeaveRuleInput,
} from "../types/types";

export class LeaveRuleRepository {
  async getByTypeKey(typeKey: string): Promise<LeaveRule | null> {
    const r = await pool.query(
      `
      SELECT lr.*
      FROM leave_rules lr
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      WHERE lt.type_key = $1
      LIMIT 1
      `,
      [typeKey.toUpperCase()]
    );
    return r.rows[0] || null;
  }

  async getAll(): Promise<(LeaveRule & { type_key: string })[]> {
    const r = await pool.query(
      `
      SELECT lt.type_key, lr.*
      FROM leave_rules lr
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      ORDER BY lt.type_key ASC
      `
    );
    return r.rows;
  }

 async createRule(
  leaveTypeId: number,
  data: CreateLeaveRuleInput
): Promise<LeaveRule> {

  const fields = Object.keys(data);
  const values = Object.values(data);

  const columns = fields.join(", ");
  const placeholders = fields.map((_, i) => `$${i + 2}`).join(", ");

  const r = await pool.query(
    `
    INSERT INTO leave_rules (leave_type_id, ${columns})
    VALUES ($1, ${placeholders})
    RETURNING *
    `,
    [leaveTypeId, ...values]
  );

  return r.rows[0];
}


  async updateRule(
    typeKey: string,
    data: UpdateLeaveRuleInput
  ): Promise<LeaveRule | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) return null;

    const values = Object.values(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");

    const r = await pool.query(
      `
      UPDATE leave_rules
      SET ${setClause}
      WHERE leave_type_id = (
        SELECT id FROM leave_types WHERE type_key = $${fields.length + 1}
      )
      RETURNING *
      `,
      [...values, typeKey.toUpperCase()]
    );

    return r.rows[0] || null;
  }

  async existsForType(typeId: number): Promise<boolean> {
    const r = await pool.query(
      `
      SELECT lr.id
      FROM leave_rules lr
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      WHERE lt.type_key = $1
      LIMIT 1
      `,
      [typeId]
    );

    return (r.rowCount ?? 0) > 0;
  }
}
