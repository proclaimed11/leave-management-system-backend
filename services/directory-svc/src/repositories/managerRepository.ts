// src/repositories/managerRepository.ts

import { pool } from "../db/connection";

export class ManagerRepository {
  async getSubordinates(managerId: string, limit: number, offset: number) {
    const result = await pool.query(
      `
      SELECT employee_number, full_name, email, department, title, status
      FROM employees
      WHERE manager_employee_number = $1
      ORDER BY full_name ASC
      LIMIT $2 OFFSET $3
      `,
      [managerId, limit, offset]
    );
    return result.rows;
  }

  async getSubordinatesCount(managerId: string) {
    const r = await pool.query(
      `SELECT COUNT(*) AS count FROM employees WHERE manager_employee_number = $1`,
      [managerId]
    );
    return Number(r.rows[0].count);
  }

  async getEmployeeForChain(empNo: string) {
    const r = await pool.query(
      `
      SELECT employee_number, full_name, manager_employee_number
      FROM employees
      WHERE employee_number = $1
      LIMIT 1
      `,
      [empNo]
    );
    return r.rows[0] || null;
  }
}
