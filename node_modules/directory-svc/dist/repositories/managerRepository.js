"use strict";
// src/repositories/managerRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerRepository = void 0;
const connection_1 = require("../db/connection");
class ManagerRepository {
    async getSubordinates(managerId, limit, offset) {
        const result = await connection_1.pool.query(`
      SELECT employee_number, full_name, email, department, title, status
      FROM employees
      WHERE manager_employee_number = $1
      ORDER BY full_name ASC
      LIMIT $2 OFFSET $3
      `, [managerId, limit, offset]);
        return result.rows;
    }
    async getSubordinatesCount(managerId) {
        const r = await connection_1.pool.query(`SELECT COUNT(*) AS count FROM employees WHERE manager_employee_number = $1`, [managerId]);
        return Number(r.rows[0].count);
    }
    async getEmployeeForChain(empNo) {
        const r = await connection_1.pool.query(`
      SELECT employee_number, full_name, manager_employee_number
      FROM employees
      WHERE employee_number = $1
      LIMIT 1
      `, [empNo]);
        return r.rows[0] || null;
    }
}
exports.ManagerRepository = ManagerRepository;
