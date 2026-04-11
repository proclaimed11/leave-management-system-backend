import { pool } from "../db/connection";

export interface OtpRow {
  id: number;
  email: string;
  otp_hash: string;
  expires_at: Date;
  attempts: number;
  used: boolean;
  created_at: Date;
}
export interface CreateOtpInput {
  email: string;
  otp_hash: string;
  expires_at: Date;
}

export class OtpRepository {

  async create(input: CreateOtpInput): Promise<OtpRow> {
    const r = await pool.query(
      `
      INSERT INTO otp_requests(email, otp_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [input.email, input.otp_hash, input.expires_at]
    );

    return r.rows[0];
  }
  async findLatestValid(email: string): Promise<OtpRow | null> {
    const r = await pool.query<OtpRow>(
      `
      SELECT *
      FROM otp_requests
      WHERE email = $1
        AND used = false
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [email.toLowerCase()]
    );

    return r.rows[0] ?? null;
  }


  async incrementAttempts(id: number): Promise<void> {
    await pool.query(
      `
      UPDATE otp_requests
      SET attempts = attempts + 1
      WHERE id = $1
      `,
      [id]
    );
  }

  async markUsed(id: number): Promise<void> {
    await pool.query(
      `
      UPDATE otp_requests
      SET used = true
      WHERE id = $1
      `,
      [id]
    );
  }

 
  async deleteExpired(): Promise<void> {
    await pool.query(
      `
      DELETE FROM otp_requests
      WHERE expires_at < NOW()
      `
    );
  }
}
