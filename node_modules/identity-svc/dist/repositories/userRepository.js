"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
// src/repositories/userRepository.ts
const connection_1 = require("../db/connection");
class UserRepository {
    async findByEmail(email) {
        const r = await connection_1.pool.query(`
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
      `, [email.toLowerCase()]);
        return r.rows[0] || null;
    }
    async findById(id) {
        const r = await connection_1.pool.query(`
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
      `, [id]);
        return r.rows[0] || null;
    }
    async create(params) {
        const r = await connection_1.pool.query(`
      INSERT INTO users (employee_number, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, employee_number, email, password_hash, created_at
      `, [params.employee_number, params.email, params.password_hash]);
        return r.rows[0];
    }
    async update(id, params) {
        const fields = [];
        const values = [];
        let i = 1;
        if (params.employee_number !== undefined) {
            fields.push(`employee_number = $${i++}`);
            values.push(params.employee_number);
        }
        if (params.email !== undefined) {
            fields.push(`email = $${i++}`);
            values.push(params.email.toLowerCase());
        }
        if (params.password_hash !== undefined) {
            fields.push(`password_hash = $${i++}`);
            values.push(params.password_hash);
        }
        if (params.is_active !== undefined) {
            fields.push(`is_active = $${i++}`);
            values.push(params.is_active);
        }
        if (fields.length === 0) {
            const existing = await this.findById(id);
            if (!existing)
                throw new Error("User not found");
            return existing;
        }
        values.push(id);
        const r = await connection_1.pool.query(`
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${i}
      RETURNING *
      `, values);
        if (!r.rows[0])
            throw new Error("User not found");
        return r.rows[0];
    }
    async deactivate(id) {
        await connection_1.pool.query(`UPDATE users SET is_active = FALSE WHERE id = $1`, [id]);
    }
}
exports.UserRepository = UserRepository;
