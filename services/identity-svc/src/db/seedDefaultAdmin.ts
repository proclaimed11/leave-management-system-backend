import { pool } from "./connection";
import { hashPassword } from "../utils/password";

const DEFAULT_ADMIN_EMPLOYEE_NUMBER = "ADM-DEMO-01";
const DEFAULT_ADMIN_EMAIL = "admin.demo@mail.com";
const DEFAULT_ADMIN_PASSWORD = "password";

/**
 * If the users table has no rows, inserts the bootstrap admin and assigns the `admin` role.
 * Runs after migrations on every startup; skips when any user already exists.
 */
export async function seedDefaultAdmin(): Promise<void> {
  const { rows: countRows } = await pool.query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM users`
  );
  const userCount = Number(countRows[0]?.c ?? "0");
  if (userCount > 0) {
    return;
  }

  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);

  await pool.query(
    `INSERT INTO users (employee_number, email, password_hash, status, is_active)
     VALUES ($1, $2, $3, 'ACTIVE', true)
     ON CONFLICT (email) DO NOTHING`,
    [DEFAULT_ADMIN_EMPLOYEE_NUMBER, DEFAULT_ADMIN_EMAIL, passwordHash]
  );

  const { rows } = await pool.query<{ id: number }>(
    `SELECT id FROM users WHERE email = $1`,
    [DEFAULT_ADMIN_EMAIL]
  );
  const userId = rows[0]?.id;
  if (!userId) {
    console.warn(
      "Default admin seed: users table was empty but row not found after insert (unexpected)."
    );
    return;
  }

  await pool.query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT $1::integer, id FROM roles WHERE role_key = 'admin' LIMIT 1
     ON CONFLICT (user_id, role_id) DO NOTHING`,
    [userId]
  );

  console.log(
    `Default admin ready: email=${DEFAULT_ADMIN_EMAIL}, employee_number=${DEFAULT_ADMIN_EMPLOYEE_NUMBER}`
  );
}
