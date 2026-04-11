"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRepository = void 0;
const connection_1 = require("../db/connection");
class CompanyRepository {
    async listActive() {
        const result = await connection_1.pool.query(`
      SELECT
        company_key,
        name,
        legal_name,
        status
      FROM companies
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
      `);
        return result.rows;
    }
    async exists(companyKey) {
        const result = await connection_1.pool.query(`
      SELECT 1
      FROM companies
      WHERE company_key = $1
        AND status = 'ACTIVE'
      LIMIT 1
      `, [companyKey]);
        return (result.rowCount ?? 0) > 0;
    }
    async getKPIs(companyKey) {
        const params = [];
        let where = "WHERE 1=1";
        if (companyKey) {
            params.push(companyKey);
            where += ` AND company_key = $${params.length}`;
        }
        const result = await connection_1.pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active,
        COUNT(*) FILTER (WHERE status = 'ARCHIVED') AS archived
      FROM employees
      ${where}
      `, params);
        return {
            totalEmployees: Number(result.rows[0].total),
            activeEmployees: Number(result.rows[0].active),
            archivedEmployees: Number(result.rows[0].archived),
        };
    }
    async getDepartmentsCount(companyKey) {
        const params = [];
        let where = "WHERE 1=1";
        if (companyKey) {
            params.push(companyKey);
            where += ` AND company_key = $${params.length}`;
        }
        const r = await connection_1.pool.query(`
      SELECT COUNT(*)::int AS cnt
      FROM departments
      ${where}
      `, params);
        return r.rows[0].cnt;
    }
    async employeesByDepartment(companyKey) {
        const params = [];
        let where = `WHERE status = 'ACTIVE'`;
        if (companyKey) {
            params.push(companyKey);
            where += ` AND company_key = $${params.length}`;
        }
        const r = await connection_1.pool.query(`
      SELECT department, COUNT(*)::int AS count
      FROM employees
      ${where}
      GROUP BY department
      ORDER BY department ASC
      `, params);
        return r.rows;
    }
    async employeesByRole(companyKey) {
        const params = [];
        let where = `WHERE status = 'ACTIVE'`;
        if (companyKey) {
            params.push(companyKey);
            where += ` AND company_key = $${params.length}`;
        }
        const r = await connection_1.pool.query(`
      SELECT directory_role AS role, COUNT(*)::int AS count
      FROM employees
      ${where}
      GROUP BY directory_role
      ORDER BY directory_role ASC
      `, params);
        return r.rows;
    }
}
exports.CompanyRepository = CompanyRepository;
