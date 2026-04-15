"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeRepository = void 0;
const connection_1 = require("../db/connection");
const avatarFileCleanup_1 = require("../utils/avatarFileCleanup");
class EmployeeRepository {
    async createEmployee(data) {
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
            "employment_type",
            "hire_date",
            "country",
        ];
        const values = fields.map((f) => data[f] ?? null);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(",");
        const result = await connection_1.pool.query(`
    INSERT INTO employees (${fields.join(",")})
    VALUES (${placeholders})
    RETURNING *
    `, values);
        return result.rows[0];
    }
    async findByEmployeeNumber(empNo) {
        const result = await connection_1.pool.query(`SELECT * FROM employees WHERE employee_number = $1 LIMIT 1`, [empNo]);
        return result.rows[0] ?? null;
    }
    async findByEmail(email) {
        const result = await connection_1.pool.query(`SELECT * FROM employees WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
        return result.rows[0] ?? null;
    }
    async listEmployees(filters) {
        const { page = 1, limit = 5, department, status, manager, search, company_key, location_prefix, strict_department, sort_by, sort_dir, } = filters;
        const offset = (page - 1) * limit;
        const SORT_COLUMNS = {
            employee_number: "employee_number",
            full_name: "full_name",
            email: "email",
            department: "department",
            title: "title",
            directory_role: "directory_role",
            status: "status",
            location: "location",
            company_key: "company_key",
        };
        const sortCol = sort_by && SORT_COLUMNS[sort_by] ? SORT_COLUMNS[sort_by] : "full_name";
        const sortOrder = sort_dir?.toLowerCase() === "desc" ? "DESC" : "ASC";
        let where = `WHERE 1=1`;
        const params = [];
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
        const searchTerm = typeof search === "string" ? search.trim() : "";
        if (searchTerm) {
            const pattern = `%${searchTerm}%`;
            params.push(pattern);
            const p = params.length;
            where += ` AND (full_name ILIKE $${p} OR email ILIKE $${p} OR employee_number ILIKE $${p})`;
        }
        if (company_key) {
            params.push(company_key);
            where += ` AND company_key = $${params.length}`;
        }
        if (location_prefix) {
            params.push(location_prefix.toUpperCase());
            where += ` AND UPPER(SPLIT_PART(COALESCE(location, ''), '_', 1)) = $${params.length}`;
        }
        if (strict_department) {
            params.push(strict_department);
            where += ` AND department = $${params.length}`;
        }
        // Get total count with same filters (before pagination)
        const countQuery = `
      SELECT COUNT(*) as total
      FROM employees
      ${where}
    `;
        const countResult = await connection_1.pool.query(countQuery, params);
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
      ORDER BY ${sortCol} ${sortOrder}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
        const result = await connection_1.pool.query(query, params);
        return {
            page,
            limit,
            count: result.rows.length, // Number of items on current page
            total, // Total number of matching employees
            total_pages: Math.ceil(total / limit), // Total pages available
            employees: result.rows,
        };
    }
    async updatePersonal(empNo, data) {
        const fields = Object.keys(data);
        if (fields.length === 0)
            return null;
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
        const values = fields.map((f) => data[f]);
        const result = await connection_1.pool.query(`
      UPDATE employees
      SET ${setClause}
      WHERE employee_number = $${fields.length + 1}
      RETURNING *
      `, [...values, empNo]);
        return result.rows[0] ?? null;
    }
    async listActiveEmployees() {
        const result = await connection_1.pool.query(`
      SELECT 
      employee_number
      FROM employees
      WHERE status = 'ACTIVE'
      ORDER BY full_name ASC
      `);
        return result.rows;
    }
    async listActiveEmployeesByCompany(companyKey) {
        const result = await connection_1.pool.query(`
      SELECT 
      employee_number
      FROM employees
      WHERE status = 'ACTIVE' AND company_key = $1
      ORDER BY full_name ASC
      `, [companyKey]);
        return result.rows;
    }
    async findActiveByCompanyAndDepartment(params) {
        const { companyKey, department } = params;
        const r = await connection_1.pool.query(`
      SELECT employee_number
      FROM employees
      WHERE company_key = $1
        AND department = $2
        AND status = 'ACTIVE'
      ORDER BY employee_number ASC
      `, [companyKey, department]);
        return r.rows.map((row) => row.employee_number);
    }
    async updateCore(empNo, data) {
        const fields = Object.keys(data);
        if (fields.length === 0)
            return null;
        if (fields.includes("manager_employee_number")) {
            const newManager = data.manager_employee_number;
            const emp = await this.findByEmployeeNumber(empNo);
            if (!emp)
                throw new Error("Employee not found");
            if (newManager === null || newManager === "") {
                return await this._applyCoreUpdate(empNo, data);
            }
            const mgr = await this.findByEmployeeNumber(newManager);
            if (!mgr)
                throw new Error("Manager does not exist");
            if (empNo === newManager) {
                throw new Error("Employee cannot be their own manager");
            }
            // 4. Must belong to same department
            if (emp.department !== mgr.department) {
                throw new Error(`Cannot assign manager: Manager must belong to the same department (${emp.department}).`);
            }
            const circular = await this._wouldCauseCircular(empNo, newManager);
            if (circular) {
                throw new Error("Circular reporting chain detected");
            }
        }
        return await this._applyCoreUpdate(empNo, data);
    }
    async getSubordinates(managerId) {
        const result = await connection_1.pool.query(`
      SELECT employee_number, full_name, email, department, title, status
      FROM employees
      WHERE manager_employee_number = $1
      ORDER BY full_name ASC
      `, [managerId]);
        return result.rows;
    }
    async countSubordinates(managerId) {
        const result = await connection_1.pool.query(`
      SELECT COUNT(*) AS count
      FROM employees
      WHERE manager_employee_number = $1
        AND status = 'ACTIVE'
      `, [managerId]);
        return Number(result.rows[0].count);
    }
    async existsEmployeeNumber(empNo) {
        const r = await connection_1.pool.query(`SELECT 1 FROM employees WHERE employee_number = $1 LIMIT 1`, [empNo]);
        return r.rowCount > 0;
    }
    async existsEmail(email) {
        const r = await connection_1.pool.query(`SELECT 1 FROM employees WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
        return r.rowCount > 0;
    }
    // Check if employee is HOD of any department
    async isHOD(employeeNumber) {
        const result = await connection_1.pool.query(`
    SELECT 1
    FROM departments
    WHERE head_employee_number = $1
    LIMIT 1
    `, [employeeNumber]);
        return result.rowCount > 0;
    }
    // Archive employee
    async archiveEmployee(employeeNumber) {
        const result = await connection_1.pool.query(`
    UPDATE employees
    SET
      status = 'ARCHIVED',
      termination_date = NOW()
    WHERE employee_number = $1
    RETURNING employee_number, status, termination_date
    `, [employeeNumber]);
        return result.rows[0] ?? null;
    }
    async updateAvatarUrl(employeeNumber, avatarUrl) {
        const result = await connection_1.pool.query(`
      UPDATE employees
      SET avatar_url = $1
      WHERE employee_number = $2
      RETURNING *
      `, [avatarUrl, employeeNumber]);
        return result.rows[0] ?? null;
    }
    async restoreEmployee(employeeNumber) {
        const result = await connection_1.pool.query(`
    UPDATE employees
    SET
      status = 'ACTIVE',
      termination_date = NULL
    WHERE employee_number = $1 AND status = 'ARCHIVED'
    RETURNING employee_number, status
    `, [employeeNumber]);
        return result.rows[0] ?? null;
    }
    /**
     * Hard-delete an archived employee. Clears directory references (dept head, managers)
     * then removes the row. Only succeeds when status is ARCHIVED.
     * Returns identity keys so directory-svc can remove the matching LMS user.
     */
    async permanentlyDeleteEmployee(employeeNumber) {
        const client = await connection_1.pool.connect();
        try {
            await client.query("BEGIN");
            const sel = await client.query(`SELECT avatar_url, email, employee_number FROM employees WHERE employee_number = $1 AND status = $2`, [employeeNumber, "ARCHIVED"]);
            if (sel.rowCount === 0) {
                await client.query("ROLLBACK");
                return { ok: false };
            }
            const oldAvatar = sel.rows[0].avatar_url;
            const identityEmail = sel.rows[0].email;
            const identityEmpNo = sel.rows[0].employee_number;
            await client.query(`UPDATE departments SET head_employee_number = NULL WHERE head_employee_number = $1`, [employeeNumber]);
            await client.query(`UPDATE employees SET manager_employee_number = NULL WHERE manager_employee_number = $1`, [employeeNumber]);
            const del = await client.query(`DELETE FROM employees WHERE employee_number = $1 AND status = $2`, [employeeNumber, "ARCHIVED"]);
            if (del.rowCount === 0) {
                await client.query("ROLLBACK");
                return { ok: false };
            }
            await client.query("COMMIT");
            (0, avatarFileCleanup_1.tryRemoveStoredAvatar)(oldAvatar);
            return {
                ok: true,
                email: identityEmail,
                employee_number: identityEmpNo,
            };
        }
        catch (err) {
            try {
                await client.query("ROLLBACK");
            }
            catch {
                /* ignore */
            }
            throw err;
        }
        finally {
            client.release();
        }
    }
    async findActiveByDepartmentExcluding(department, excludeEmpNo) {
        const r = await connection_1.pool.query(`
      SELECT employee_number, full_name
      FROM employees
      WHERE department = $1
        AND status = 'ACTIVE'
        AND employee_number <> $2
      ORDER BY full_name ASC
      `, [department, excludeEmpNo]);
        return r.rows;
    }
    async listManagerCandidatesByDepartment(deptKey) {
        const result = await connection_1.pool.query(`
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
    `, [deptKey]);
        return result.rows;
    }
    async _applyCoreUpdate(empNo, data) {
        const fields = Object.keys(data);
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
        const values = fields.map((f) => data[f]);
        const result = await connection_1.pool.query(`
      UPDATE employees
      SET ${setClause}
      WHERE employee_number = $${fields.length + 1}
      RETURNING *
    `, [...values, empNo]);
        return result.rows[0] ?? null;
    }
    async _wouldCauseCircular(empNo, newManager) {
        let current = newManager;
        while (true) {
            const r = await connection_1.pool.query(`
      SELECT manager_employee_number
      FROM employees
      WHERE employee_number = $1
      `, [current]);
            if (r.rows.length === 0)
                return false;
            const mgr = r.rows[0].manager_employee_number;
            if (!mgr)
                return false;
            if (mgr === empNo)
                return true;
            current = mgr;
        }
    }
}
exports.EmployeeRepository = EmployeeRepository;
