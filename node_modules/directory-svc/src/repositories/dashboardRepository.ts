import { pool } from "../db/connection";

export class DashboardRepository {
  async getKPIs() {
    const result = await pool.query(`
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

  async getDepartmentsCount(): Promise<number> {
    const r = await pool.query(`SELECT COUNT(*)::int AS cnt FROM departments`);
    return r.rows[0].cnt;
  }

  async employeesByDepartment() {
    const r = await pool.query(`
      SELECT department, COUNT(*)::int AS count
      FROM employees
      WHERE status = 'ACTIVE'
      GROUP BY department
      ORDER BY department ASC
    `);

    return r.rows;
  }

  async employeesByRole() {
    const r = await pool.query(`
      SELECT directory_role AS role, COUNT(*)::int AS count
      FROM employees
      WHERE status = 'ACTIVE'
      GROUP BY directory_role
      ORDER BY directory_role ASC
    `);

    return r.rows;
  }
}
