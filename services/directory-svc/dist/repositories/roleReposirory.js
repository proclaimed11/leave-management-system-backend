"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const connection_1 = require("../db/connection");
class RoleRepository {
    async listRoles() {
        const result = await connection_1.pool.query(`
      SELECT role_key, name, description
      FROM roles
      ORDER BY name ASC
      `);
        return result.rows;
    }
    async findByKey(roleKey) {
        const result = await connection_1.pool.query(`
      SELECT role_key, name, description
      FROM roles
      WHERE role_key = $1
      LIMIT 1
      `, [roleKey]);
        return result.rows[0] ?? null;
    }
    async updateRole(empNo, roleKey) {
        const result = await connection_1.pool.query(`
    UPDATE employees
    SET directory_role = $1
    WHERE employee_number = $2
    RETURNING employee_number, full_name, email, directory_role
    `, [roleKey, empNo]);
        return result.rows[0] ?? null;
    }
    async listByRole(params) {
        const { roleKey, page, limit, search } = params;
        const offset = (page - 1) * limit;
        const filters = [`directory_role = $1`];
        const values = [roleKey];
        let i = 2;
        if (search) {
            filters.push(`
      (
        LOWER(full_name) LIKE LOWER($${i})
        OR LOWER(email) LIKE LOWER($${i})
        OR LOWER(employee_number) LIKE LOWER($${i})
      )
    `);
            values.push(`%${search}%`);
            i++;
        }
        const whereClause = filters.join(" AND ");
        // total matching rows
        const totalResult = await connection_1.pool.query(`
    SELECT COUNT(*)::int AS total
    FROM employees
    WHERE ${whereClause}
    `, values);
        const rowsResult = await connection_1.pool.query(`
    SELECT employee_number, full_name, email, department, title, directory_role
    FROM employees
    WHERE ${whereClause}
    ORDER BY full_name ASC
    LIMIT $${i} OFFSET $${i + 1}
    `, [...values, limit, offset]);
        return {
            total: totalResult.rows[0].total,
            employees: rowsResult.rows,
        };
    }
    async countDirectReports(empNo) {
        const result = await connection_1.pool.query(`
    SELECT COUNT(*)::int AS count
    FROM employees
    WHERE manager_employee_number = $1
    `, [empNo]);
        return result.rows[0].count;
    }
    async countDepartmentsWhereHOD(employeeNumber) {
        const result = await connection_1.pool.query(`
    SELECT COUNT(*)::int AS count
    FROM departments
    WHERE hod_employee_number = $1
    `, [employeeNumber]);
        return result.rows[0]?.count ?? 0;
    }
    async exists(roleKey) {
        const r = await connection_1.pool.query(`SELECT 1 FROM roles WHERE role_key = $1 LIMIT 1`, [roleKey]);
        return r.rowCount > 0;
    }
    async listHodCandidatesByDepartment(department) {
        const result = await connection_1.pool.query(`
    SELECT
      e.employee_number,
      e.full_name,
      e.title
    FROM employees e
    WHERE
      e.directory_role = 'hod'
      AND e.department = $1
      AND e.status = 'ACTIVE'
    ORDER BY e.full_name ASC
    `, [department]);
        return result.rows;
    }
    async listSupervisorCandidatesByDepartment(department) {
        const result = await connection_1.pool.query(`
    SELECT
      e.employee_number,
      e.full_name,
      e.title
    FROM employees e
    WHERE
      e.directory_role = 'supervisor'
      AND e.department = $1
      AND e.status = 'ACTIVE'
    ORDER BY e.full_name ASC
    `, [department]);
        return result.rows;
    }
}
exports.RoleRepository = RoleRepository;
