"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarRepository = void 0;
const connection_1 = require("../db/connection");
class CalendarRepository {
    /** -------------------------------
     *  Insert a generated calendar day
     *  ------------------------------- */
    async insertCalendarDay(calendar_date, employee_number, department, leave_type_key) {
        const result = await connection_1.pool.query(`
      INSERT INTO calendar_days (
        calendar_date,
        employee_number,
        department,
        leave_type_key
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `, [calendar_date, employee_number, department, leave_type_key]);
        return result.rows[0];
    }
    /** -------------------------------
     *  Delete days for a given month (rebuild)
     *  ------------------------------- */
    async deleteMonth(year_month) {
        await connection_1.pool.query(`
      DELETE FROM calendar_days
      WHERE TO_CHAR(calendar_date, 'YYYY-MM') = $1
      `, [year_month]);
    }
    /** -------------------------------
     *  Fetch month view
     *  ------------------------------- */
    async getMonth(year_month) {
        const result = await connection_1.pool.query(`
      SELECT *
      FROM calendar_days
      WHERE TO_CHAR(calendar_date, 'YYYY-MM') = $1
      ORDER BY calendar_date ASC
      `, [year_month]);
        return result.rows;
    }
    /** -------------------------------
     *  Fetch conflicts (threshold optional)
     *  ------------------------------- */
    async getDepartmentConflicts(department, threshold) {
        const result = await connection_1.pool.query(`
      SELECT 
        calendar_date,
        COUNT(*) AS total_on_leave,
        ARRAY_AGG(employee_number) AS employees
      FROM calendar_days
      WHERE department = $1
      GROUP BY calendar_date
      HAVING COUNT(*) >= $2
      ORDER BY calendar_date ASC
      `, [department, threshold]);
        return result.rows.map(r => ({
            date: r.calendar_date,
            total_on_leave: Number(r.total_on_leave),
            employees: r.employees
        }));
    }
    /** -------------------------------
     *  Create monthly snapshot
     *  ------------------------------- */
    async insertSnapshot(input) {
        const result = await connection_1.pool.query(`
      INSERT INTO calendar_snapshots (
        department, year_month, total_employees, total_leaves
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `, [
            input.department,
            input.year_month,
            input.total_employees,
            input.total_leaves
        ]);
        return result.rows[0];
    }
    /** -------------------------------
     *  Fetch snapshot for analytics
     *  ------------------------------- */
    async getSnapshots(department) {
        const result = await connection_1.pool.query(`
      SELECT *
      FROM calendar_snapshots
      WHERE department = $1
      ORDER BY generated_at DESC
      LIMIT 24
      `, [department]);
        return result.rows;
    }
}
exports.CalendarRepository = CalendarRepository;
