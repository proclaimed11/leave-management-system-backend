"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationRepository = void 0;
const connection_1 = require("../db/connection");
class LocationRepository {
    async listActive() {
        const result = await connection_1.pool.query(`
      SELECT location_key, name, is_head_office, status, country_group
      FROM locations
      WHERE status = 'ACTIVE'
      ORDER BY is_head_office DESC, name ASC
      `);
        return result.rows;
    }
    async exists(locationKey) {
        const result = await connection_1.pool.query(`
      SELECT 1
      FROM locations
      WHERE location_key = $1
        AND status = 'ACTIVE'
      LIMIT 1
      `, [locationKey]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.LocationRepository = LocationRepository;
