"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const connection_1 = require("../db/connection");
class RefreshTokenRepository {
    async store(user_id, token, expires) {
        await connection_1.pool.query(`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`, [user_id, token, expires]);
    }
    async find(token) {
        const r = await connection_1.pool.query(`SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false`, [token]);
        return r.rows[0] || null;
    }
    async revoke(token) {
        await connection_1.pool.query(`UPDATE refresh_tokens SET revoked = true WHERE token = $1`, [token]);
    }
    async revokeAll(userId) {
        await connection_1.pool.query(`UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`, [userId]);
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
