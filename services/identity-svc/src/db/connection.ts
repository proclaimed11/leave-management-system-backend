import { Pool } from "pg";
import { CONFIG } from "../utils/config";
 
const ssl =
  CONFIG.DB.SSL
    ? { rejectUnauthorized: false }
    : undefined;
 
export const pool = new Pool({
  host: CONFIG.DB.HOST,
  port: CONFIG.DB.PORT,
  user: CONFIG.DB.USER,
  password: CONFIG.DB.PASSWORD,
  database: CONFIG.DB.NAME,
  ssl,
  max: 15,            // connection pool size
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});
 
// optional: simple health check
export async function assertDb() {
  await pool.query("SELECT 1");
}