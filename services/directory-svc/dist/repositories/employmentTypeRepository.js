"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmploymentTypeRepository = void 0;
const connection_1 = require("../db/connection");
class EmploymentTypeRepository {
    async listAll() {
        const result = await connection_1.pool.query(`
      SELECT type_key, name, description
      FROM employment_types
      ORDER BY name ASC
      `);
        return result.rows;
    }
}
exports.EmploymentTypeRepository = EmploymentTypeRepository;
