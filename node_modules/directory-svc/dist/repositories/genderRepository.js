"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenderRepository = void 0;
const connection_1 = require("../db/connection");
class GenderRepository {
    async listActive() {
        const result = await connection_1.pool.query(`
      SELECT gender_key, name, status
      FROM genders
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
      `);
        return result.rows;
    }
}
exports.GenderRepository = GenderRepository;
