// src/repositories/roleRepository.ts
import { pool } from "../db/connection";
import { RoleRow } from "../types/types";

export class RoleRepository {
  async getByKey(role_key: RoleRow["role_key"]): Promise<RoleRow | null> {
    const r = await pool.query<RoleRow>(
      `
      SELECT *
      FROM roles
      WHERE role_key = $1
      LIMIT 1
      `,
      [role_key]
    );
    return r.rows[0] || null;
  }

  async listAll(): Promise<RoleRow[]> {
    const r = await pool.query<RoleRow>(`SELECT * FROM roles ORDER BY id ASC`);
    return r.rows;
  }
  async getAllRoles(): Promise<RoleRow[]> {
    const result = await pool.query<RoleRow>(
      `SELECT id, role_key, name, description, created_at 
     FROM roles 
     ORDER BY 
       CASE role_key
         WHEN 'employee' THEN 1
         WHEN 'supervisor' THEN 2
         WHEN 'hod' THEN 3
         WHEN 'hr' THEN 4
         WHEN 'management' THEN 5
         WHEN 'admin' THEN 6
         WHEN 'consultant' THEN 7
         ELSE 8
       END`
    );
    return result.rows;
  }
}
