import { pool } from "../db/connection";

export class RefreshTokenRepository {
  async store(user_id: number, token: string, expires: Date) {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user_id, token, expires]
    );
  }

  async find(token: string) {
    const r = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false`,
      [token]
    );
    return r.rows[0] || null;
  }

  async revoke(token: string) {
    await pool.query(`UPDATE refresh_tokens SET revoked = true WHERE token = $1`, [token]);
  }

  async revokeAll(userId: number) {
    await pool.query(`UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`, [userId]);
  }
}
