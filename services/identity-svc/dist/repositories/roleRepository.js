"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
// src/repositories/roleRepository.ts
const connection_1 = require("../db/connection");
class RoleRepository {
    async getByKey(role_key) {
        const r = await connection_1.pool.query(`
      SELECT *
      FROM roles
      WHERE role_key = $1
      LIMIT 1
      `, [role_key]);
        return r.rows[0] || null;
    }
    async listAll() {
        const r = await connection_1.pool.query(`SELECT * FROM roles ORDER BY id ASC`);
        return r.rows;
    }
    async getAllRoles() {
        const result = await connection_1.pool.query(`SELECT id, role_key, name, description, created_at 
     FROM roles 
     ORDER BY 
       CASE role_key
         WHEN 'employee' THEN 1
         WHEN 'supervisor' THEN 2
         WHEN 'hod' THEN 3
         WHEN 'HR' THEN 4
         WHEN 'management' THEN 5
         WHEN 'admin' THEN 6
         WHEN 'consultant' THEN 7
         ELSE 8
       END`);
        return result.rows;
    }
}
exports.RoleRepository = RoleRepository;
