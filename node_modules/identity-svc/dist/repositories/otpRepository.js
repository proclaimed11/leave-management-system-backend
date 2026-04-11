"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRepository = void 0;
const connection_1 = require("../db/connection");
class OtpRepository {
    async create(input) {
        const r = await connection_1.pool.query(`
      INSERT INTO otp_requests(email, otp_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
      `, [input.email, input.otp_hash, input.expires_at]);
        return r.rows[0];
    }
    async findLatestValid(email) {
        const r = await connection_1.pool.query(`
      SELECT *
      FROM otp_requests
      WHERE email = $1
        AND used = false
      ORDER BY created_at DESC
      LIMIT 1
      `, [email.toLowerCase()]);
        return r.rows[0] ?? null;
    }
    async incrementAttempts(id) {
        await connection_1.pool.query(`
      UPDATE otp_requests
      SET attempts = attempts + 1
      WHERE id = $1
      `, [id]);
    }
    async markUsed(id) {
        await connection_1.pool.query(`
      UPDATE otp_requests
      SET used = true
      WHERE id = $1
      `, [id]);
    }
    async deleteExpired() {
        await connection_1.pool.query(`
      DELETE FROM otp_requests
      WHERE expires_at < NOW()
      `);
    }
}
exports.OtpRepository = OtpRepository;
