import { pool } from "../db/connection";
import type { EmploymentType } from "../types/types";

export class EmploymentTypeRepository {
  async listAll(): Promise<EmploymentType[]> {
    const result = await pool.query(
      `
      SELECT type_key, name, description
      FROM employment_types
      ORDER BY name ASC
      `
    );
    return result.rows;
  }
}
