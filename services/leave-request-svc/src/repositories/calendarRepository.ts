// src/repositories/leaveCalendar.repository.ts

import { Pool } from "pg";
import { pool } from "../db/connection";

export interface LeaveCalendarRecord {
  leave_id: number;
  company_key: string;
  employee_number: string;
  leave_type_key: string;
  start_date: string;
  end_date: string;
  total_days: number;
}

export class LeaveCalendarRepository {
  constructor(private readonly db: Pool) {}

  async getApprovedInRange(params: {
    companyKey: string;
    start: string;
    end: string;
    employeeNumbers?: string[];
  }): Promise<LeaveCalendarRecord[]> {
    const { companyKey, start, end, employeeNumbers } = params;

    const baseParams: any[] = [companyKey, start, end];
    let employeeFilter = "";

    if (employeeNumbers && employeeNumbers.length > 0) {
      baseParams.push(employeeNumbers);
      employeeFilter = `AND employee_number = ANY($4)`;
    }

    const sql = `
    SELECT
      id AS leave_id,
      company_key,
      employee_number,
      leave_type_key,
      start_date::text,
      end_date::text,
      total_days
    FROM leave_requests
    WHERE company_key = $1
      AND status = 'APPROVED'
      AND daterange(start_date, end_date, '[]')
          && daterange($2::date, $3::date, '[]')
      ${employeeFilter}
    ORDER BY start_date ASC
  `;

    const { rows } = await pool.query(sql, baseParams);
    return rows;
  }

  async countApprovedOnDate(params: {
    companyKey: string;
    date: string;
    employeeNumbers?: string[];
  }): Promise<number> {
    const { companyKey, date, employeeNumbers } = params;

    const baseParams: any[] = [companyKey, date];
    let employeeFilter = "";

    if (employeeNumbers && employeeNumbers.length > 0) {
      baseParams.push(employeeNumbers);
      employeeFilter = `AND employee_number = ANY($3)`;
    }

    const sql = `
    SELECT COUNT(DISTINCT employee_number)::int AS count
    FROM leave_requests
    WHERE company_key = $1
      AND status = 'APPROVED'
      AND daterange(start_date, end_date, '[]') @> $2::date
      ${employeeFilter}
  `;

    const { rows } = await pool.query(sql, baseParams);
    return rows[0]?.count ?? 0;
  }
}
