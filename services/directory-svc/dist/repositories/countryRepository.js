"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryRepository = void 0;
const connection_1 = require("../db/connection");
class CountryRepository {
    async listAll() {
        const result = await connection_1.pool.query(`
      SELECT country_key, name, description
      FROM countries
      ORDER BY name ASC
      `);
        return result.rows;
    }
}
exports.CountryRepository = CountryRepository;
