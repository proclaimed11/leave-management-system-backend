import { pool } from "../db/connection";
import { DirectoryStatus } from "../types/types";

export class StatusRepository {
  async listStatuses(): Promise<DirectoryStatus[]> {
    const result = await pool.query(
      `
      SELECT status_key, name, description
      FROM statuses
      ORDER BY name ASC
      `
    );

    return result.rows;
  }

  async findByKey(statusKey: string): Promise<DirectoryStatus | null> {
    const result = await pool.query(
      `
      SELECT status_key, name, description
      FROM statuses
      WHERE status_key = $1
      LIMIT 1
      `,
      [statusKey]
    );

    return result.rows[0] ?? null;
  }
}
