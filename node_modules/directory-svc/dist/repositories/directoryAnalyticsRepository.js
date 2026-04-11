"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryAnalyticsRepository = void 0;
class DirectoryAnalyticsRepository {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async getDepartmentSummary() {
        const { rows } = await this.pool.query(`
    SELECT
    company_key,
    department,
    COUNT(*)::int AS total
    FROM employees
    WHERE status = 'ACTIVE'
    AND department IS NOT NULL
    AND department <> ''
    GROUP BY company_key, department
    ORDER BY company_key ASC, department ASC;
      `);
        return rows;
    }
    async getEmployeesByNumbers(employeeNumbers) {
        if (employeeNumbers.length === 0)
            return [];
        const { rows } = await this.pool.query(`
        SELECT
        employee_number,
        full_name,
        department,
        company_key
        FROM employees
        WHERE employee_number = ANY($1)
    `, [employeeNumbers]);
        return rows;
    }
}
exports.DirectoryAnalyticsRepository = DirectoryAnalyticsRepository;
