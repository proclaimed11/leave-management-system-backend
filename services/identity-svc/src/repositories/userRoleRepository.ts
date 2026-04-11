// src/repositories/userRoleRepository.ts
import { pool } from "../db/connection";
import { AssignRoleInput, RoleRow, UserRoleRow } from "../types/types";

export class UserRoleRepository {
  async assignRole(data: AssignRoleInput): Promise<void> {
    const roleRes = await pool.query<{ id: number }>(
      `SELECT id FROM roles WHERE role_key = $1`,
      [data.role_key]
    );

    if (roleRes.rowCount === 0) {
      throw new Error(`Role not found: ${data.role_key}`);
    }

    const roleId = roleRes.rows[0].id;

    await pool.query(
      `
      INSERT INTO user_roles (user_id, role_id, granted_by, granted_at)
      VALUES ($1, $2, NULL, NOW())
      ON CONFLICT DO NOTHING
      `,
      [data.user_id, roleId]
    );
  }

  async getRoleForUser(userId: number): Promise<RoleRow["role_key"]> {
  const r = await pool.query(
    `
    SELECT role_key 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = $1
    LIMIT 1
    `,
    [userId]
  );

  return r.rows[0]?.role_key ?? "user";
}

}
