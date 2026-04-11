"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const connection_1 = require("../db/connection");
class DashboardRepository {
    async getKPIs() {
        const result = await connection_1.pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active,
        COUNT(*) FILTER (WHERE status = 'ARCHIVED') AS archived
      FROM employees
    `);
        return {
            totalEmployees: Number(result.rows[0].total),
            activeEmployees: Number(result.rows[0].active),
            archivedEmployees: Number(result.rows[0].archived),
        };
    }
    async getDepartmentsCount() {
        const r = await connection_1.pool.query(`SELECT COUNT(*)::int AS cnt FROM departments`);
        return r.rows[0].cnt;
    }
    async employeesByDepartment() {
        const r = await connection_1.pool.query(`
      SELECT department, COUNT(*)::int AS count
      FROM employees
      WHERE status = 'ACTIVE'
      GROUP BY department
      ORDER BY department ASC
    `);
        return r.rows;
    }
    async employeesByRole() {
        const r = await connection_1.pool.query(`
      SELECT directory_role AS role, COUNT(*)::int AS count
      FROM employees
      WHERE status = 'ACTIVE'
      GROUP BY directory_role
      ORDER BY directory_role ASC
    `);
        return r.rows;
    }
}
exports.DashboardRepository = DashboardRepository;
