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

  async getCountryOverview(countryPrefix: string) {
    const prefix = countryPrefix.trim().toUpperCase();
    const result = await pool.query(
      `
      WITH scoped_employees AS (
        SELECT *
        FROM employees
        WHERE UPPER(SPLIT_PART(COALESCE(location, ''), '_', 1)) = $1
      )
      SELECT
        (SELECT COUNT(*)::int FROM scoped_employees) AS total_employees,
        (SELECT COUNT(*)::int FROM scoped_employees WHERE status = 'ACTIVE') AS active_employees,
        (SELECT COUNT(*)::int FROM scoped_employees WHERE status = 'ARCHIVED') AS archived_employees,
        (SELECT COUNT(DISTINCT department)::int
         FROM scoped_employees
         WHERE department IS NOT NULL AND TRIM(department) <> '') AS departments,
        (SELECT COUNT(*)::int
         FROM locations
         WHERE UPPER(SPLIT_PART(location_key, '_', 1)) = $1
           AND UPPER(COALESCE(status, '')) = 'ACTIVE') AS branches
      `,
      [prefix]
    );

    const row = result.rows[0] ?? {};
    return {
      country_prefix: prefix,
      kpis: {
        totalEmployees: Number(row.total_employees ?? 0),
        activeEmployees: Number(row.active_employees ?? 0),
        archivedEmployees: Number(row.archived_employees ?? 0),
        departments: Number(row.departments ?? 0),
        branches: Number(row.branches ?? 0),
      },
    };
  }
}
