"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaritalStatusRepository = void 0;
const connection_1 = require("../db/connection");
class MaritalStatusRepository {
    async listActive() {
        const result = await connection_1.pool.query(`
      SELECT status_key, name, status
      FROM marital_statuses
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
      `);
        return result.rows;
    }
}
exports.MaritalStatusRepository = MaritalStatusRepository;
