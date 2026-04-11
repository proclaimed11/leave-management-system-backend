import { pool } from "../db/connection";
import {
  CompanyHolidayRow,
  CreateHolidayDTO,
  UpdateHolidayDTO,
  ListHolidaysFilter,
} from "../types/holiday";

function normalizeNullable(v?: string | null) {
  const s = typeof v === "string" ? v.trim() : v;
  return s === "" ? null : (s ?? null);
}

export class HolidayRepository {
  async createHoliday(dto: CreateHolidayDTO): Promise<CompanyHolidayRow> {
    const holiday_type = dto.holiday_type ?? "PUBLIC";

    const company_key = normalizeNullable(dto.company_key);
    const location = normalizeNullable(dto.location);

    const is_recurring = dto.is_recurring ?? false;

    const res = await pool.query<CompanyHolidayRow>(
      `
      INSERT INTO company_holidays (
        holiday_date,
        name,
        holiday_type,
        company_key,
        location,
        is_recurring,
        notes,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING
        id,
        holiday_date::text as holiday_date,
        name,
        holiday_type,
        company_key,
        location,
        is_recurring,
        notes,
        created_by,
        created_at::text as created_at,
        updated_at::text as updated_at
      `,
      [
        dto.holiday_date,
        dto.name.trim(),
        holiday_type,
        company_key,
        location,
        is_recurring,
        dto.notes ?? null,
        dto.created_by ?? null,
      ],
    );

    return res.rows[0];
  }
  async listHolidays(
    filter: ListHolidaysFilter = {},
  ): Promise<CompanyHolidayRow[]> {
    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (filter.start) {
      where.push(`holiday_date >= $${i++}`);
      params.push(filter.start);
    }
    if (filter.end) {
      where.push(`holiday_date <= $${i++}`);
      params.push(filter.end);
    }
    if (filter.holiday_type) {
      where.push(`holiday_type = $${i++}`);
      params.push(filter.holiday_type);
    }

    if (filter.company_key !== undefined) {
      if (filter.company_key === null) {
        where.push(`company_key IS NULL`);
      } else {
        where.push(`company_key = $${i++}`);
        params.push(filter.company_key);
      }
    }

    if (filter.location !== undefined) {
      if (filter.location === null) {
        where.push(`location IS NULL`);
      } else {
        where.push(`location = $${i++}`);
        params.push(filter.location);
      }
    }

    const sql = `
      SELECT
        id,
        holiday_date::text as holiday_date,
        name,
        holiday_type,
        company_key,
        location,
        is_recurring,
        notes,
        created_by,
        created_at::text as created_at,
        updated_at::text as updated_at
      FROM company_holidays
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY holiday_date ASC, company_key ASC NULLS FIRST, location ASC NULLS FIRST
    `;

    const res = await pool.query<CompanyHolidayRow>(sql, params);
    return res.rows;
  }
  async getHolidaysBetween(params: {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  company_key: string;
  location?: string | null;
}): Promise<CompanyHolidayRow[]> {

  const company_key = params.company_key.toUpperCase();
  const location = normalizeNullable(params.location);

  const sql = `
    SELECT
      id,
      holiday_date::text as holiday_date,
      name,
      holiday_type,
      company_key,
      location,
      is_recurring,
      notes,
      created_by,
      created_at::text as created_at,
      updated_at::text as updated_at
    FROM company_holidays h
    WHERE
      (
        -- Non-recurring holidays
        (h.is_recurring = false AND h.holiday_date BETWEEN $1 AND $2)

        OR

        -- Recurring holidays (match month + day)
        (
          h.is_recurring = true
          AND EXISTS (
            SELECT 1
            FROM generate_series($1::date, $2::date, interval '1 day') d
            WHERE
              EXTRACT(MONTH FROM d) = EXTRACT(MONTH FROM h.holiday_date)
              AND EXTRACT(DAY FROM d) = EXTRACT(DAY FROM h.holiday_date)
          )
        )
      )
      AND (h.company_key IS NULL OR h.company_key = $3)
      AND (
        $4::text IS NULL
        OR h.location IS NULL
        OR h.location = $4
      )
    ORDER BY h.holiday_date ASC
  `;

  const res = await pool.query<CompanyHolidayRow>(sql, [
    params.start,
    params.end,
    company_key,
    location,
  ]);

  return res.rows;
}

  async updateHoliday(
    id: number,
    dto: UpdateHolidayDTO,
  ): Promise<CompanyHolidayRow | null> {
    const sets: string[] = [];
    const params: any[] = [];
    let i = 1;

    const pushSet = (col: string, val: any) => {
      sets.push(`${col} = $${i++}`);
      params.push(val);
    };

    if (dto.holiday_date) pushSet("holiday_date", dto.holiday_date);
    if (dto.name !== undefined) pushSet("name", dto.name.trim());
    if (dto.holiday_type) pushSet("holiday_type", dto.holiday_type);

    if (dto.company_key !== undefined)
      pushSet("company_key", normalizeNullable(dto.company_key));
    if (dto.location !== undefined)
      pushSet("location", normalizeNullable(dto.location));

    if (dto.is_recurring !== undefined)
      pushSet("is_recurring", dto.is_recurring);
    if (dto.notes !== undefined) pushSet("notes", dto.notes ?? null);

    if (!sets.length) {
      // nothing to update
      const existing = await pool.query<CompanyHolidayRow>(
        `
        SELECT
          id, holiday_date::text as holiday_date, name, holiday_type, company_key, location,
          is_recurring, notes, created_by, created_at::text as created_at, updated_at::text as updated_at
        FROM company_holidays
        WHERE id = $1
        `,
        [id],
      );
      return existing.rows[0] ?? null;
    }

    sets.push(`updated_at = NOW()`);

    params.push(id);

    const res = await pool.query<CompanyHolidayRow>(
      `
      UPDATE company_holidays
      SET ${sets.join(", ")}
      WHERE id = $${i}
      RETURNING
        id,
        holiday_date::text as holiday_date,
        name,
        holiday_type,
        company_key,
        location,
        is_recurring,
        notes,
        created_by,
        created_at::text as created_at,
        updated_at::text as updated_at
      `,
      params,
    );

    return res.rows[0] ?? null;
  }
  async deleteHoliday(id: number): Promise<boolean> {
    const res = await pool.query(`DELETE FROM company_holidays WHERE id = $1`, [
      id,
    ]);
    return res.rowCount === 1;
  }
}
