import { pool } from "../db/connection";
import {
  CalendarDayRow,
  CalendarSnapshotRow,
  YearMonth,
  ISODate,
  MonthlySnapshotInput
} from "../types/types";

export class CalendarRepository {

  /** -------------------------------
   *  Insert a generated calendar day
   *  ------------------------------- */
  async insertCalendarDay(
    calendar_date: ISODate,
    employee_number: string,
    department: string,
    leave_type_key: string
  ): Promise<CalendarDayRow> {
    const result = await pool.query(
      `
      INSERT INTO calendar_days (
        calendar_date,
        employee_number,
        department,
        leave_type_key
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [calendar_date, employee_number, department, leave_type_key]
    );

    return result.rows[0];
  }

  /** -------------------------------
   *  Delete days for a given month (rebuild)
   *  ------------------------------- */
  async deleteMonth(year_month: YearMonth): Promise<void> {
    await pool.query(
      `
      DELETE FROM calendar_days
      WHERE TO_CHAR(calendar_date, 'YYYY-MM') = $1
      `,
      [year_month]
    );
  }

  /** -------------------------------
   *  Fetch month view
   *  ------------------------------- */
  async getMonth(year_month: YearMonth): Promise<CalendarDayRow[]> {
    const result = await pool.query(
      `
      SELECT *
      FROM calendar_days
      WHERE TO_CHAR(calendar_date, 'YYYY-MM') = $1
      ORDER BY calendar_date ASC
      `,
      [year_month]
    );

    return result.rows;
  }

  /** -------------------------------
   *  Fetch conflicts (threshold optional)
   *  ------------------------------- */
  async getDepartmentConflicts(
    department: string,
    threshold: number
  ): Promise<{ date: ISODate; total_on_leave: number; employees: string[] }[]> {
    const result = await pool.query(
      `
      SELECT 
        calendar_date,
        COUNT(*) AS total_on_leave,
        ARRAY_AGG(employee_number) AS employees
      FROM calendar_days
      WHERE department = $1
      GROUP BY calendar_date
      HAVING COUNT(*) >= $2
      ORDER BY calendar_date ASC
      `,
      [department, threshold]
    );

    return result.rows.map(r => ({
      date: r.calendar_date,
      total_on_leave: Number(r.total_on_leave),
      employees: r.employees
    }));
  }

  /** -------------------------------
   *  Create monthly snapshot
   *  ------------------------------- */
  async insertSnapshot(input: MonthlySnapshotInput): Promise<CalendarSnapshotRow> {
    const result = await pool.query(
      `
      INSERT INTO calendar_snapshots (
        department, year_month, total_employees, total_leaves
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        input.department,
        input.year_month,
        input.total_employees,
        input.total_leaves
      ]
    );

    return result.rows[0];
  }

  /** -------------------------------
   *  Fetch snapshot for analytics
   *  ------------------------------- */
  async getSnapshots(department: string): Promise<CalendarSnapshotRow[]> {
    const result = await pool.query(
      `
      SELECT *
      FROM calendar_snapshots
      WHERE department = $1
      ORDER BY generated_at DESC
      LIMIT 24
      `,
      [department]
    );

    return result.rows;
  }

}
