import { pool } from "../db/connection";
import { EmployeeCore, EmployeeFull, EmployeeFilters } from "../types/types";

export class EmployeeRepository {
  async createEmployee(data: EmployeeFull): Promise<EmployeeFull> {
    const fields = [
      "employee_number",
      "full_name",
      "email",
      "department",
      "title",
      "location",
      "manager_employee_number",
      "phone",
      "address",
      "emergency_contact_name",
      "emergency_contact_phone",
      "marital_status",
      "gender",
      "date_of_birth",
    ];

    const values = fields.map((f) => (data as any)[f] ?? null);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(",");

    const result = await pool.query(
      `
    INSERT INTO employees (${fields.join(",")})
    VALUES (${placeholders})
    RETURNING *
    `,
      values,
    );

    return result.rows[0];
  }

  async findByEmployeeNumber(empNo: string): Promise<EmployeeFull | null> {
    const result = await pool.query(
      `SELECT * FROM employees WHERE employee_number = $1 LIMIT 1`,
      [empNo],
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<EmployeeFull | null> {
    const result = await pool.query(
      `SELECT * FROM employees WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async listEmployees(filters: EmployeeFilters) {
    const {
      page = 1,
      limit = 5,
      department,
      status,
      manager,
      search,
      company_key,
    } = filters;

    const offset = (page - 1) * limit;

    let where = `WHERE 1=1`;
    const params: any[] = [];

    if (department) {
      params.push(department);
      where += ` AND department = $${params.length}`;
    }
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    if (manager) {
      params.push(manager);
      where += ` AND manager_employee_number = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }
    if (company_key) {
      params.push(company_key);
      where += ` AND company_key = $${params.length}`;
    }

    // Get total count with same filters (before pagination)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM employees
      ${where}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = Number(countResult.rows[0].total);

    // Add pagination params
    params.push(limit);
    params.push(offset);

    // Get paginated results
    const query = `
      SELECT 
        employee_number, full_name, email, department, title, status, directory_role, company_key,location
      FROM employees
      ${where}
      ORDER BY full_name ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);

    return {
      page,
      limit,
      count: result.rows.length, // Number of items on current page
      total, // Total number of matching employees
      total_pages: Math.ceil(total / limit), // Total pages available
      employees: result.rows,
    };
  }
  async updatePersonal(empNo: string, data: any): Promise<EmployeeFull | null> {
    const fields = Object.keys(data);

    if (fields.length === 0) return null;

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values = fields.map((f) => data[f]);

    const result = await pool.query(
      `
      UPDATE employees
      SET ${setClause}
      WHERE employee_number = $${fields.length + 1}
      RETURNING *
      `,
      [...values, empNo],
    );

    return result.rows[0] ?? null;
  }
  async listActiveEmployees(): Promise<EmployeeFull[]> {
    const result = await pool.query(
      `
      SELECT 
      employee_number
      FROM employees
      WHERE status = 'ACTIVE'
      ORDER BY full_name ASC
      `,
    );

    return result.rows;
  }
  async listActiveEmployeesByCompany(
    companyKey: string,
  ): Promise<EmployeeFull[]> {
    const result = await pool.query(
      `
      SELECT 
      employee_number
      FROM employees
      WHERE status = 'ACTIVE' AND company_key = $1
      ORDER BY full_name ASC
      `,
      [companyKey],
    );

    return result.rows;
  }
  async findActiveByCompanyAndDepartment(params: {
    companyKey: string;
    department: string;
  }): Promise<string[]> {
    const { companyKey, department } = params;

    const r = await pool.query<{ employee_number: string }>(
      `
      SELECT employee_number
      FROM employees
      WHERE company_key = $1
        AND department = $2
        AND status = 'ACTIVE'
      ORDER BY employee_number ASC
      `,
      [companyKey, department],
    );

    return r.rows.map((row) => row.employee_number);
  }
  async updateCore(empNo: string, data: any): Promise<EmployeeFull | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) return null;

    if (fields.includes("manager_employee_number")) {
      const newManager = data.manager_employee_number;

      const emp = await this.findByEmployeeNumber(empNo);
      if (!emp) throw new Error("Employee not found");

      if (newManager === null || newManager === "") {
        return await this._applyCoreUpdate(empNo, data);
      }

      const mgr = await this.findByEmployeeNumber(newManager);
      if (!mgr) throw new Error("Manager does not exist");

      if (empNo === newManager) {
        throw new Error("Employee cannot be their own manager");
      }

      // 4. Must belong to same department
      if (emp.department !== mgr.department) {
        throw new Error(
          `Cannot assign manager: Manager must belong to the same department (${emp.department}).`,
        );
      }

      const circular = await this._wouldCauseCircular(empNo, newManager);
      if (circular) {
        throw new Error("Circular reporting chain detected");
      }
    }

    return await this._applyCoreUpdate(empNo, data);
  }

  async getSubordinates(managerId: string) {
    const result = await pool.query(
      `
      SELECT employee_number, full_name, email, department, title, status
      FROM employees
      WHERE manager_employee_number = $1
      ORDER BY full_name ASC
      `,
      [managerId],
    );

    return result.rows;
  }

  async countSubordinates(managerId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) AS count FROM employees WHERE manager_employee_number = $1`,
      [managerId],
    );
    return Number(result.rows[0].count);
  }
  async existsEmployeeNumber(empNo: string): Promise<boolean> {
    const r = await pool.query(
      `SELECT 1 FROM employees WHERE employee_number = $1 LIMIT 1`,
      [empNo],
    );
    return r.rowCount! > 0;
  }

  async existsEmail(email: string): Promise<boolean> {
    const r = await pool.query(
      `SELECT 1 FROM employees WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email],
    );
    return r.rowCount! > 0;
  }
  // Check if employee is HOD of any department
  async isHOD(employeeNumber: string): Promise<boolean> {
    const result = await pool.query(
      `
    SELECT 1
    FROM departments
    WHERE head_employee_number = $1
    LIMIT 1
    `,
      [employeeNumber],
    );

    return result.rowCount! > 0;
  }

  // Archive employee
  async archiveEmployee(employeeNumber: string) {
    const result = await pool.query(
      `
    UPDATE employees
    SET
      status = 'ARCHIVED',
      termination_date = NOW()
    WHERE employee_number = $1
    RETURNING employee_number, status, termination_date
    `,
      [employeeNumber],
    );

    return result.rows[0] ?? null;
  }
  async findActiveByDepartmentExcluding(
    department: string,
    excludeEmpNo: string,
  ) {
    const r = await pool.query(
      `
      SELECT employee_number, full_name
      FROM employees
      WHERE department = $1
        AND status = 'ACTIVE'
        AND employee_number <> $2
      ORDER BY full_name ASC
      `,
      [department, excludeEmpNo],
    );

    return r.rows;
  }
  async listManagerCandidatesByDepartment(deptKey: string) {
    const result = await pool.query(
      `
    SELECT
      e.employee_number,
      e.full_name,
      e.directory_role
    FROM employees e
    LEFT JOIN departments d
      ON d.dept_key = e.department
    WHERE e.department = $1
      AND e.status = 'ACTIVE'
      AND (
        e.directory_role = 'supervisor'
        OR e.employee_number = d.head_employee_number
      )
    ORDER BY
      CASE
        WHEN e.employee_number = d.head_employee_number THEN 1
        WHEN e.directory_role = 'supervisor' THEN 2
      END,
      e.full_name ASC
    `,
      [deptKey],
    );

    return result.rows;
  }

  private async _applyCoreUpdate(
    empNo: string,
    data: any,
  ): Promise<EmployeeFull | null> {
    const fields = Object.keys(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values = fields.map((f) => data[f]);

    const result = await pool.query(
      `
      UPDATE employees
      SET ${setClause}
      WHERE employee_number = $${fields.length + 1}
      RETURNING *
    `,
      [...values, empNo],
    );

    return result.rows[0] ?? null;
  }
  private async _wouldCauseCircular(
    empNo: string,
    newManager: string,
  ): Promise<boolean> {
    let current = newManager;

    while (true) {
      const r = await pool.query(
        `
      SELECT manager_employee_number
      FROM employees
      WHERE employee_number = $1
      `,
        [current],
      );

      if (r.rows.length === 0) return false;
      const mgr = r.rows[0].manager_employee_number;

      if (!mgr) return false;

      if (mgr === empNo) return true;

      current = mgr;
    }
  }
}
