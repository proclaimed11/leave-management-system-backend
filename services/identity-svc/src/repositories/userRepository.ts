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
    must_change_password?: boolean;
  }): Promise<UserRow> {
    const mustChange = params.must_change_password === true;
    const r = await pool.query<UserRow>(
      `
      INSERT INTO users (employee_number, email, password_hash, must_change_password)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [params.employee_number, params.email, params.password_hash, mustChange]
    );

    return r.rows[0];
  }
  async update(
    id: number,
    params: Partial<Pick<UserRow, "employee_number" | "email" | "is_active">> & {
      password_hash?: string;
      must_change_password?: boolean;
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

    if (params.must_change_password !== undefined) {
      fields.push(`must_change_password = $${i++}`);
      values.push(params.must_change_password);
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

  /**
   * Hard-delete a user provisioned from directory (matching email + employee_number).
   * Refresh tokens and user_roles rows are removed via ON DELETE CASCADE.
   */
  async deleteByEmailAndEmployeeNumber(
    email: string,
    employeeNumber: string
  ): Promise<boolean> {
    const r = await pool.query(
      `
      DELETE FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
        AND UPPER(TRIM(COALESCE(employee_number, ''))) = UPPER(TRIM($2))
      RETURNING id
      `,
      [email, employeeNumber]
    );
    return (r.rowCount ?? 0) > 0;
  }
}
