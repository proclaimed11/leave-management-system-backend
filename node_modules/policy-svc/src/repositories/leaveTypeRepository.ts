// src/repositories/leaveTypeRepository.ts

import { pool } from "../db/connection";
import { LeaveType, CreateLeaveTypeInput, UpdateLeaveTypeInput, LeaveRule } from "../types/types";

export class LeaveTypeRepository {

  async getAll(): Promise<LeaveType[]> {
    const r = await pool.query(
      `
      SELECT 
        id, type_key, name, description, default_days, is_active, created_at
      FROM leave_types
      ORDER BY type_key ASC
      `
    );
    return r.rows;
  }

async getByTypeKey(typeKey: string) {
  const r = await pool.query(
    `
    SELECT
      lt.id,
      lt.type_key,
      lt.name,
      lt.description,
      lt.default_days,
      lt.is_active,
      lt.created_at,

      -- leave rules
      lr.entitlement_days,
      lr.max_consecutive_days,
      lr.max_per_year,
      lr.requires_approval,
      lr.approval_levels,
      lr.paid,
      lr.deduct_from_balance,
      lr.requires_document,
      lr.attachment_required_after_days,
      lr.allow_weekends,
      lr.allow_public_holidays,
      lr.min_service_months,
      lr.gender_restriction,
      lr.notice_days_required,

      -- comp off rules (nullable)
      cor.hours_per_off_day,
      cor.sunday_work_earn,
      cor.public_holiday_earn,
      cor.max_carry_forward,
      cor.expiry_days,
      cor.min_hours_per_entry

    FROM leave_types lt
    LEFT JOIN leave_rules lr
      ON lr.leave_type_id = lt.id
    LEFT JOIN comp_off_rules cor
      ON lt.type_key = 'COMP_OFF'

    WHERE lt.type_key = $1
    LIMIT 1
    `,
    [typeKey.toUpperCase()]
  );

  return r.rows[0] || null;
}


  async exists(typeKey: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM leave_types WHERE type_key = $1`,
    [typeKey.toUpperCase()]
  );

  return (r.rowCount ?? 0) > 0;
}


  async create(input: CreateLeaveTypeInput): Promise<LeaveType> {
    const { type_key, name, description, default_days } = input;

    const r = await pool.query(
      `
      INSERT INTO leave_types (type_key, name, description, default_days)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type_key, name, description, default_days, is_active, created_at
      `,
      [type_key.toUpperCase(), name, description ?? null, default_days ?? null]
    );

    return r.rows[0];
  }

  async update(typeKey: string, updates: UpdateLeaveTypeInput): Promise<LeaveType | null> {
    const fields = Object.keys(updates);
    if (fields.length === 0) return null;

    const values = Object.values(updates);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");

    // Last parameter is type_key
    const query = `
      UPDATE leave_types
      SET ${setClause}
      WHERE type_key = $${fields.length + 1}
      RETURNING id, type_key, name, description, default_days, is_active, created_at
    `;

    values.push(typeKey.toUpperCase());

    const r = await pool.query(query, values);
    return r.rows[0] || null;
  }

  async disable(typeKey: string): Promise<LeaveType | null> {
    const r = await pool.query(
      `
      UPDATE leave_types
      SET is_active = false
      WHERE type_key = $1
      RETURNING id, type_key, name, description, default_days, is_active, created_at
      `,
      [typeKey.toUpperCase()]
    );

    return r.rows[0] || null;
  }
  async listActiveRules(): Promise<LeaveRule[]> {
  const r = await pool.query(`
    SELECT
      lt.type_key,
      lr.entitlement_days,
      lr.max_consecutive_days,
      lr.max_per_year,
      lr.requires_approval,
      lr.approval_levels,
      lr.paid,
      lr.deduct_from_balance,
      lr.requires_document,
      lr.attachment_required_after_days,
      lr.allow_weekends,
      lr.allow_public_holidays,
      lr.min_service_months,
      lr.gender_restriction,
      lr.notice_days_required
    FROM leave_rules lr
    JOIN leave_types lt ON lt.id = lr.leave_type_id
    WHERE lt.is_active = true
  `);

  return r.rows;
}
  
}
