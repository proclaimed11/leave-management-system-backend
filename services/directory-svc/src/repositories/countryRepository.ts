import { pool } from "../db/connection";
import type { Country } from "../types/types";

export class CountryRepository {
  async listAll(): Promise<Country[]> {
    const result = await pool.query(
      `
      SELECT country_key, name, description
      FROM countries
      ORDER BY name ASC
      `
    );
    return result.rows;
  }
}
