"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const connection_1 = require("../db/connection");
class DepartmentRepository {
    /** Check if a department_key already exists */
    async exists(dept_key) {
        const r = await connection_1.pool.query(`SELECT 1 FROM departments WHERE dept_key = $1 LIMIT 1`, [dept_key]);
        return (r.rowCount ?? 0) > 0;
    }
    /** Create a new department with optional head_employee_number */
    async create(input) {
        const r = await connection_1.pool.query(`
    INSERT INTO departments (
      dept_key,
      name,
      status,
      company_key,
      head_employee_number
    )
    VALUES ($1, $2, COALESCE($3, 'active'), $4, $5)
    RETURNING *
    `, [
            input.dept_key,
            input.name,
            input.status ?? "active",
            input.company_key,
            input.head_employee_number ?? null,
        ]);
        return r.rows[0];
    }
    async getByKey(dept_key) {
        const r = await connection_1.pool.query(`
    SELECT
      d.*,
      e.full_name AS head_employee_name
    FROM departments d
    LEFT JOIN employees e
      ON e.employee_number = d.head_employee_number
    WHERE d.dept_key = $1
    `, [dept_key]);
        return r.rows[0] || null;
    }
    async list() {
        const r = await connection_1.pool.query(`SELECT * FROM departments ORDER BY name ASC`);
        return r.rows;
    }
    async update(dept_key, patch) {
        const fields = [];
        const vals = [];
        let i = 1;
        if (patch.name !== undefined) {
            fields.push(`name = $${i++}`);
            vals.push(patch.name);
        }
        if (patch.status !== undefined) {
            fields.push(`status = $${i++}`);
            vals.push(patch.status);
        }
        if (patch.company_key !== undefined) {
            fields.push(`company_key = $${i++}`);
            vals.push(patch.company_key);
        }
        if (fields.length === 0)
            return await this.getByKey(dept_key);
        vals.push(dept_key);
        const r = await connection_1.pool.query(`
    UPDATE departments
    SET ${fields.join(", ")},
        updated_at = NOW()
    WHERE dept_key = $${i}
    RETURNING *
    `, vals);
        return r.rows[0] || null;
    }
    async setHead(dept_key, employee_number) {
        const r = await connection_1.pool.query(`
      UPDATE departments
      SET head_employee_number = $1, updated_at = NOW()
      WHERE dept_key = $2
      RETURNING *
      `, [employee_number, dept_key]);
        return r.rows[0] || null;
    }
    async delete(dept_key) {
        await connection_1.pool.query(`DELETE FROM departments WHERE dept_key = $1`, [dept_key]);
    }
    async countEmployees(dept_key) {
        const r = await connection_1.pool.query(`SELECT COUNT(*)::int AS cnt FROM employees WHERE department = $1`, [dept_key]);
        return r.rows[0]?.cnt ?? 0;
    }
    async listSummaries(filters) {
        let where = "WHERE 1=1";
        const params = [];
        if (filters?.company_key) {
            params.push(filters.company_key);
            where += ` AND d.company_key = $${params.length}`;
        }
        const r = await connection_1.pool.query(`
    SELECT 
      d.dept_key,
      d.name,
      d.status,
      d.head_employee_number,
      h.full_name AS head_employee_name,
      d.company_key,
      COALESCE(e.cnt,0) AS employees_count
    FROM departments d
    LEFT JOIN (
      SELECT department, COUNT(*)::int AS cnt
      FROM employees
      GROUP BY department
    ) e ON e.department = d.dept_key
     LEFT JOIN employees h
      ON h.employee_number = d.head_employee_number
    ${where}
    ORDER BY d.name ASC
    `, params);
        return r.rows;
    }
    async employeeExists(empNo) {
        const r = await connection_1.pool.query(`SELECT 1 FROM employees WHERE employee_number = $1 LIMIT 1`, [empNo]);
        return r.rowCount > 0;
    }
    async employeeInDepartment(empNo, dept_key) {
        const r = await connection_1.pool.query(`SELECT 1 FROM employees WHERE employee_number = $1 AND department = $2 LIMIT 1`, [empNo, dept_key]);
        return r.rowCount > 0;
    }
    async existsByName(name) {
        const r = await connection_1.pool.query(`SELECT 1 FROM departments WHERE dept_key = $1 LIMIT 1`, [name]);
        return r.rowCount > 0;
    }
}
exports.DepartmentRepository = DepartmentRepository;
