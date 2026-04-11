import { pool } from "../db/connection";
import { Gender } from "../types/types";

export class GenderRepository {
  async listActive(): Promise<Gender[]> {
    const result = await pool.query(
      `
      SELECT gender_key, name, status
      FROM genders
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
      `
    );

    return result.rows;
  }
}
