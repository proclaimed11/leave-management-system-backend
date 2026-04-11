import { pool } from "../db/connection";
export class CompoOffRepository {
  async getRules() {
    const r = await pool.query(`SELECT * FROM comp_off_rules LIMIT 1`);
    return r.rows[0] ?? null;
  }

  async createRules(data: any) {
    const existing = await this.getRules();
    if (existing) {
      throw new Error("Comp-off rules already exist");
    }

    const r = await pool.query(
      `
    INSERT INTO comp_off_rules (
      hours_per_off_day,
      sunday_work_earn,
      public_holiday_earn,
      min_hours_per_entry,
      max_carry_forward,
      expiry_days
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
      [
        data.hours_per_off_day ?? 8,
        data.sunday_work_earn ?? true,
        data.public_holiday_earn ?? true,
        data.min_hours_per_entry ?? 4,
        data.max_carry_forward ?? 0,
        data.expiry_days ?? 90,
      ]
    );

    return r.rows[0];
  }

async updateRules(id: number, data: any) {
  const fields = Object.keys(data);
  if (!fields.length) {
    const r = await pool.query(
      `SELECT * FROM comp_off_rules WHERE id = $1`,
      [id]
    );
    return r.rows[0];
  }

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = Object.values(data);

  const r = await pool.query(
    `
    UPDATE comp_off_rules
    SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *
    `,
    [...values, id]
  );

  return r.rows[0];
}
}