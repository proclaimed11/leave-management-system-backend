import { pool } from "../db/connection";
import { Location } from "../types/types";

export class LocationRepository {
  async listActive(): Promise<Location[]> {
    const result = await pool.query(
      `
      SELECT location_key, name, is_head_office, status
      FROM locations
      WHERE status = 'ACTIVE'
      ORDER BY is_head_office DESC, name ASC
      `
    );

    return result.rows;
  }
  async exists(locationKey: string): Promise<boolean> {
    const result = await pool.query(
      `
      SELECT 1
      FROM locations
      WHERE location_key = $1
        AND status = 'ACTIVE'
      LIMIT 1
      `,
      [locationKey]
    );

    return (result.rowCount ?? 0) > 0;
  }
}
