import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST || process.env.PGHOST || "localhost",
  port: Number(process.env.DB_PORT || process.env.PGPORT) || 5432,
  user: process.env.DB_USER || process.env.PGUSER || "postgres",
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || "nabokiLASCAP1998",
  database: process.env.DB_NAME || process.env.PGDATABASE || "audit_svc"
});
