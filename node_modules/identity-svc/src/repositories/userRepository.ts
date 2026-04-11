// src/repositories/userRepository.ts
import { pool } from "../db/connection";
import { UserRow } from "../types/types";

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const r = await pool.query<UserRow>(
      `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email.toLowerCase()]
    );
    return r.rows[0] || null;
  }

  async findById(id: number): Promise<UserRow | null> {
    const r = await pool.query<UserRow>(
      `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );
    return r.rows[0] || null;
  }

  async create(params: {
    employee_number: string | null;
    email: string;
    password_hash: string;
  }): Promise<UserRow> {
    const r = await pool.query(
      `
      INSERT INTO users (employee_number, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, employee_number, email, password_hash, created_at
      `,
      [params.employee_number, params.email, params.password_hash]
    );

    return r.rows[0];
  }
  async update(
    id: number,
    params: Partial<Pick<UserRow, "employee_number" | "email" | "is_active">> & {
      password_hash?: string;
    }
  ): Promise<UserRow> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (params.employee_number !== undefined) {
      fields.push(`employee_number = $${i++}`);
      values.push(params.employee_number);
    }

    if (params.email !== undefined) {
      fields.push(`email = $${i++}`);
      values.push(params.email.toLowerCase());
    }

    if (params.password_hash !== undefined) {
      fields.push(`password_hash = $${i++}`);
      values.push(params.password_hash);
    }

    if (params.is_active !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(params.is_active);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error("User not found");
      return existing;
    }

    values.push(id);

    const r = await pool.query<UserRow>(
      `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${i}
      RETURNING *
      `,
      values
    );

    if (!r.rows[0]) throw new Error("User not found");
    return r.rows[0];
  }
  async deactivate(id: number): Promise<void> {
    await pool.query(`UPDATE users SET is_active = FALSE WHERE id = $1`, [id]);
  }
}
