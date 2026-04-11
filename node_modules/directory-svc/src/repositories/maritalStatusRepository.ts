import { pool } from "../db/connection";
import { MaritalStatus } from "../types/types";

export class MaritalStatusRepository {
  async listActive(): Promise<MaritalStatus[]> {
    const result = await pool.query(
      `
      SELECT status_key, name, status
      FROM marital_statuses
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
      `
    );

    return result.rows;
  }
}
