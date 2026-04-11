"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusRepository = void 0;
const connection_1 = require("../db/connection");
class StatusRepository {
    async listStatuses() {
        const result = await connection_1.pool.query(`
      SELECT status_key, name, description
      FROM statuses
      ORDER BY name ASC
      `);
        return result.rows;
    }
    async findByKey(statusKey) {
        const result = await connection_1.pool.query(`
      SELECT status_key, name, description
      FROM statuses
      WHERE status_key = $1
      LIMIT 1
      `, [statusKey]);
        return result.rows[0] ?? null;
    }
}
exports.StatusRepository = StatusRepository;
