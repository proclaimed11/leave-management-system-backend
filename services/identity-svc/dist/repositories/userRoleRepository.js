"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleRepository = void 0;
// src/repositories/userRoleRepository.ts
const connection_1 = require("../db/connection");
class UserRoleRepository {
    async assignRole(data) {
        const roleRes = await connection_1.pool.query(`SELECT id FROM roles WHERE role_key = $1`, [data.role_key]);
        if (roleRes.rowCount === 0) {
            throw new Error(`Role not found: ${data.role_key}`);
        }
        const roleId = roleRes.rows[0].id;
        await connection_1.pool.query(`
      INSERT INTO user_roles (user_id, role_id, granted_by, granted_at)
      VALUES ($1, $2, NULL, NOW())
      ON CONFLICT DO NOTHING
      `, [data.user_id, roleId]);
    }
    async getRoleForUser(userId) {
        const r = await connection_1.pool.query(`
    SELECT role_key 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = $1
    LIMIT 1
    `, [userId]);
        return r.rows[0]?.role_key ?? "user";
    }
}
exports.UserRoleRepository = UserRoleRepository;
